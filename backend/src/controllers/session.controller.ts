import { Request, Response } from 'express';
import { SessionService } from '../services/session.service';

const sessionService = new SessionService();

export class SessionController {
  async getAllSessions(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const sessions = await sessionService.getAllSessions(eventId);
      return res.json(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  }

  async getSession(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const session = await sessionService.getSessionById(id);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      return res.json(session);
    } catch (error) {
      console.error('Error fetching session:', error);
      return res.status(500).json({ error: 'Failed to fetch session' });
    }
  }

  async createSession(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const session = await sessionService.createSession(eventId, req.body);

      // Broadcast to WebSocket clients
      if (req.app.locals.wsService) {
        req.app.locals.wsService.broadcast('session:new', session);
      }

      return res.status(201).json(session);
    } catch (error) {
      console.error('Error creating session:', error);
      return res.status(500).json({ error: 'Failed to create session' });
    }
  }

  async updateSession(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const session = await sessionService.updateSession(id, req.body);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Broadcast to WebSocket clients
      if (req.app.locals.wsService) {
        req.app.locals.wsService.broadcast('session:updated', session);
      }

      return res.json(session);
    } catch (error) {
      console.error('Error updating session:', error);
      return res.status(500).json({ error: 'Failed to update session' });
    }
  }

  async deleteSession(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await sessionService.deleteSession(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Broadcast to WebSocket clients
      if (req.app.locals.wsService) {
        req.app.locals.wsService.broadcast('session:deleted', { id });
      }

      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting session:', error);
      return res.status(500).json({ error: 'Failed to delete session' });
    }
  }
}
