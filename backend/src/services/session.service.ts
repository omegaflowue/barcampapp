import { pool } from '../config/database';
import { Session, CreateSessionRequest, UpdateSessionRequest, SessionWithSchedule } from '../types';

export class SessionService {
  async getAllSessions(eventId: string): Promise<SessionWithSchedule[]> {
    const query = `
      SELECT
        s.*,
        sch.room_id,
        r.name as room_name,
        sch.time_slot_id,
        ts.start_time,
        ts.end_time
      FROM sessions s
      LEFT JOIN schedules sch ON s.id = sch.session_id
      LEFT JOIN rooms r ON sch.room_id = r.id
      LEFT JOIN time_slots ts ON sch.time_slot_id = ts.id
      WHERE s.event_id = $1
      ORDER BY s.vote_count DESC, s.created_at DESC
    `;

    const result = await pool.query(query, [eventId]);

    return result.rows.map(row => ({
      id: row.id,
      event_id: row.event_id,
      title: row.title,
      description: row.description,
      presenter: row.presenter,
      duration: row.duration,
      infrastructure: row.infrastructure,
      vote_count: row.vote_count,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      scheduledSlot: row.room_id ? {
        roomId: row.room_id,
        roomName: row.room_name,
        timeSlotId: row.time_slot_id,
        startTime: row.start_time,
        endTime: row.end_time
      } : undefined
    }));
  }

  async getSessionById(sessionId: string): Promise<SessionWithSchedule | null> {
    const query = `
      SELECT
        s.*,
        sch.room_id,
        r.name as room_name,
        sch.time_slot_id,
        ts.start_time,
        ts.end_time
      FROM sessions s
      LEFT JOIN schedules sch ON s.id = sch.session_id
      LEFT JOIN rooms r ON sch.room_id = r.id
      LEFT JOIN time_slots ts ON sch.time_slot_id = ts.id
      WHERE s.id = $1
    `;

    const result = await pool.query(query, [sessionId]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      event_id: row.event_id,
      title: row.title,
      description: row.description,
      presenter: row.presenter,
      duration: row.duration,
      infrastructure: row.infrastructure,
      vote_count: row.vote_count,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      scheduledSlot: row.room_id ? {
        roomId: row.room_id,
        roomName: row.room_name,
        timeSlotId: row.time_slot_id,
        startTime: row.start_time,
        endTime: row.end_time
      } : undefined
    };
  }

  async createSession(eventId: string, data: CreateSessionRequest): Promise<Session> {
    const query = `
      INSERT INTO sessions (event_id, title, description, presenter, duration, infrastructure)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      eventId,
      data.title,
      data.description,
      data.presenter,
      data.duration,
      JSON.stringify(data.infrastructure)
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async updateSession(sessionId: string, data: UpdateSessionRequest): Promise<Session | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramCounter++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramCounter++}`);
      values.push(data.description);
    }
    if (data.presenter !== undefined) {
      fields.push(`presenter = $${paramCounter++}`);
      values.push(data.presenter);
    }
    if (data.duration !== undefined) {
      fields.push(`duration = $${paramCounter++}`);
      values.push(data.duration);
    }
    if (data.infrastructure !== undefined) {
      fields.push(`infrastructure = $${paramCounter++}`);
      values.push(JSON.stringify(data.infrastructure));
    }

    if (fields.length === 0) {
      return this.getSessionById(sessionId) as Promise<Session>;
    }

    values.push(sessionId);
    const query = `
      UPDATE sessions
      SET ${fields.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const query = 'DELETE FROM sessions WHERE id = $1';
    const result = await pool.query(query, [sessionId]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
