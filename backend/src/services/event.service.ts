import { pool } from '../config/database';
import { Event, Room, TimeSlot, CreateEventRequest, CreateRoomRequest, CreateTimeSlotRequest, EventStatus } from '../types';

export class EventService {
  // Events
  async getAllEvents(): Promise<Event[]> {
    const result = await pool.query('SELECT * FROM events ORDER BY date DESC');
    return result.rows;
  }

  async getEventById(eventId: string): Promise<Event | null> {
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
    return result.rows[0] || null;
  }

  async createEvent(data: CreateEventRequest): Promise<Event> {
    const query = `
      INSERT INTO events (name, date)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await pool.query(query, [data.name, data.date]);
    return result.rows[0];
  }

  async updateEventStatus(eventId: string, status: EventStatus): Promise<Event | null> {
    const query = `
      UPDATE events
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [status, eventId]);
    return result.rows[0] || null;
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM events WHERE id = $1', [eventId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Rooms
  async getRooms(eventId: string): Promise<Room[]> {
    const result = await pool.query(
      'SELECT * FROM rooms WHERE event_id = $1 ORDER BY name',
      [eventId]
    );
    return result.rows;
  }

  async createRoom(eventId: string, data: CreateRoomRequest): Promise<Room> {
    const query = `
      INSERT INTO rooms (event_id, name, capacity, infrastructure)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [
      eventId,
      data.name,
      data.capacity,
      JSON.stringify(data.infrastructure)
    ]);

    return result.rows[0];
  }

  async deleteRoom(roomId: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM rooms WHERE id = $1', [roomId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Time Slots
  async getTimeSlots(eventId: string): Promise<TimeSlot[]> {
    const result = await pool.query(
      'SELECT * FROM time_slots WHERE event_id = $1 ORDER BY start_time',
      [eventId]
    );
    return result.rows;
  }

  async createTimeSlot(eventId: string, data: CreateTimeSlotRequest): Promise<TimeSlot> {
    const query = `
      INSERT INTO time_slots (event_id, start_time, end_time, type, label)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(query, [
      eventId,
      data.start_time,
      data.end_time,
      data.type,
      data.label || null
    ]);

    return result.rows[0];
  }

  async deleteTimeSlot(timeSlotId: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM time_slots WHERE id = $1', [timeSlotId]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
