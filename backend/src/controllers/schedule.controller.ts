import { Request, Response } from 'express';
import { ScheduleService } from '../services/schedule.service';

const scheduleService = new ScheduleService();

export class ScheduleController {
  async getSchedule(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const schedule = await scheduleService.getSchedule(eventId);
      res.json(schedule);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      res.status(500).json({ error: 'Failed to fetch schedule' });
    }
  }

  async optimizeSchedule(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const result = await scheduleService.optimizeSchedule(eventId);

      res.json({
        status: 'success',
        schedule: result.schedule,
        metrics: result.metrics
      });
    } catch (error) {
      console.error('Error optimizing schedule:', error);
      res.status(500).json({
        status: 'error',
        error: 'Failed to optimize schedule'
      });
    }
  }

  async publishSchedule(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const { schedule } = req.body;

      await scheduleService.publishSchedule(eventId, schedule);

      // Broadcast to WebSocket clients
      if (req.app.locals.wsService) {
        req.app.locals.wsService.broadcast('schedule:published', {
          eventId,
          schedule
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error publishing schedule:', error);
      res.status(500).json({ error: 'Failed to publish schedule' });
    }
  }

  async clearSchedule(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      await scheduleService.clearSchedule(eventId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error clearing schedule:', error);
      res.status(500).json({ error: 'Failed to clear schedule' });
    }
  }
}
