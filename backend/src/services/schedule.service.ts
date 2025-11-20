import { pool } from '../config/database';
import { Session, Room, TimeSlot, Schedule, ScheduleProposal, OptimizationMetrics, InfrastructureType } from '../types';

export class ScheduleService {
  async getSchedule(eventId: string): Promise<Schedule[]> {
    const query = `
      SELECT s.* FROM schedules s
      JOIN sessions sess ON s.session_id = sess.id
      WHERE sess.event_id = $1
    `;

    const result = await pool.query(query, [eventId]);
    return result.rows;
  }

  async optimizeSchedule(eventId: string): Promise<{
    schedule: ScheduleProposal[];
    metrics: OptimizationMetrics;
  }> {
    // Fetch sessions, rooms, and time slots
    const [sessions, rooms, timeSlots] = await Promise.all([
      this.getSessionsForScheduling(eventId),
      this.getRooms(eventId),
      this.getTimeSlots(eventId)
    ]);

    // Sort sessions by vote count (descending)
    sessions.sort((a, b) => b.vote_count - a.vote_count);

    const schedule: ScheduleProposal[] = [];
    const roomSlotUsage = new Map<string, Set<string>>(); // roomId -> Set of timeSlotIds

    let scheduledSessions = 0;
    let totalVotes = 0;
    let scheduledVotes = 0;

    sessions.forEach(session => {
      totalVotes += session.vote_count;
    });

    // Greedy algorithm: Assign sessions to rooms and time slots
    for (const session of sessions) {
      let assigned = false;

      for (const timeSlot of timeSlots) {
        if (assigned) break;

        for (const room of rooms) {
          // Check if room is already occupied in this time slot
          const usedSlots = roomSlotUsage.get(room.id) || new Set();
          if (usedSlots.has(timeSlot.id)) {
            continue;
          }

          // Check if room has required infrastructure
          if (!this.hasRequiredInfrastructure(session.infrastructure, room.infrastructure)) {
            continue;
          }

          // Check if room capacity is sufficient (estimate: vote_count as interest indicator)
          if (room.capacity < session.vote_count && session.vote_count > 50) {
            continue; // Skip if way too small
          }

          // Assign session to this room and time slot
          schedule.push({
            sessionId: session.id,
            roomId: room.id,
            timeSlotId: timeSlot.id,
            startTime: timeSlot.start_time
          });

          // Mark room-slot as used
          if (!roomSlotUsage.has(room.id)) {
            roomSlotUsage.set(room.id, new Set());
          }
          roomSlotUsage.get(room.id)!.add(timeSlot.id);

          scheduledSessions++;
          scheduledVotes += session.vote_count;
          assigned = true;
          break;
        }
      }
    }

    // Calculate metrics
    const voteSatisfaction = totalVotes > 0 ? scheduledVotes / totalVotes : 0;
    const conflicts = sessions.length - scheduledSessions;
    const totalSlots = rooms.length * timeSlots.length;
    const usedSlots = schedule.length;
    const roomUtilization = totalSlots > 0 ? usedSlots / totalSlots : 0;

    const metrics: OptimizationMetrics = {
      voteSatisfaction,
      conflicts,
      roomUtilization
    };

    return { schedule, metrics };
  }

  async publishSchedule(eventId: string, proposals: ScheduleProposal[]): Promise<boolean> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Delete existing schedule for this event
      await client.query(`
        DELETE FROM schedules
        WHERE session_id IN (
          SELECT id FROM sessions WHERE event_id = $1
        )
      `, [eventId]);

      // Insert new schedule
      for (const proposal of proposals) {
        await client.query(`
          INSERT INTO schedules (session_id, room_id, time_slot_id)
          VALUES ($1, $2, $3)
        `, [proposal.sessionId, proposal.roomId, proposal.timeSlotId]);

        // Update session status
        await client.query(`
          UPDATE sessions
          SET status = 'SCHEDULED'
          WHERE id = $1
        `, [proposal.sessionId]);
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async clearSchedule(eventId: string): Promise<boolean> {
    const query = `
      DELETE FROM schedules
      WHERE session_id IN (
        SELECT id FROM sessions WHERE event_id = $1
      )
    `;

    await pool.query(query, [eventId]);
    return true;
  }

  // Helper methods
  private async getSessionsForScheduling(eventId: string): Promise<Session[]> {
    const result = await pool.query(
      'SELECT * FROM sessions WHERE event_id = $1',
      [eventId]
    );
    return result.rows;
  }

  private async getRooms(eventId: string): Promise<Room[]> {
    const result = await pool.query(
      'SELECT * FROM rooms WHERE event_id = $1',
      [eventId]
    );
    return result.rows;
  }

  private async getTimeSlots(eventId: string): Promise<TimeSlot[]> {
    const result = await pool.query(
      'SELECT * FROM time_slots WHERE event_id = $1 ORDER BY start_time',
      [eventId]
    );
    return result.rows;
  }

  private hasRequiredInfrastructure(
    required: InfrastructureType[],
    available: InfrastructureType[]
  ): boolean {
    return required.every(req => available.includes(req));
  }
}
