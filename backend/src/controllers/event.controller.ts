import { Request, Response } from 'express';
import { EventService } from '../services/event.service';

const eventService = new EventService();

export class EventController {
  // Events
  async getAllEvents(req: Request, res: Response) {
    try {
      const events = await eventService.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  }

  async getEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const event = await eventService.getEventById(id);

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.json(event);
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({ error: 'Failed to fetch event' });
    }
  }

  async createEvent(req: Request, res: Response) {
    try {
      const event = await eventService.createEvent(req.body);
      res.status(201).json(event);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  }

  async updateEventStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const event = await eventService.updateEventStatus(id, status);

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Broadcast to WebSocket clients
      if (req.app.locals.wsService) {
        req.app.locals.wsService.broadcast('event:status_changed', event);
      }

      res.json(event);
    } catch (error) {
      console.error('Error updating event status:', error);
      res.status(500).json({ error: 'Failed to update event status' });
    }
  }

  async deleteEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await eventService.deleteEvent(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ error: 'Failed to delete event' });
    }
  }

  // Rooms
  async getRooms(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const rooms = await eventService.getRooms(eventId);
      res.json(rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      res.status(500).json({ error: 'Failed to fetch rooms' });
    }
  }

  async createRoom(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const room = await eventService.createRoom(eventId, req.body);
      res.status(201).json(room);
    } catch (error) {
      console.error('Error creating room:', error);
      res.status(500).json({ error: 'Failed to create room' });
    }
  }

  async deleteRoom(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await eventService.deleteRoom(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Room not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting room:', error);
      res.status(500).json({ error: 'Failed to delete room' });
    }
  }

  // Time Slots
  async getTimeSlots(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const timeSlots = await eventService.getTimeSlots(eventId);
      res.json(timeSlots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      res.status(500).json({ error: 'Failed to fetch time slots' });
    }
  }

  async createTimeSlot(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const timeSlot = await eventService.createTimeSlot(eventId, req.body);
      res.status(201).json(timeSlot);
    } catch (error) {
      console.error('Error creating time slot:', error);
      res.status(500).json({ error: 'Failed to create time slot' });
    }
  }

  async deleteTimeSlot(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await eventService.deleteTimeSlot(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Time slot not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting time slot:', error);
      res.status(500).json({ error: 'Failed to delete time slot' });
    }
  }
}
