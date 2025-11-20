import { Request, Response } from 'express';
import { VotingService } from '../services/voting.service';

const votingService = new VotingService();

export class VotingController {
  async addVote(req: Request, res: Response) {
    try {
      const { id: sessionId } = req.params;
      const { userId } = req.body;

      const result = await votingService.addVote(sessionId, userId);

      // Broadcast to WebSocket clients
      if (req.app.locals.wsService) {
        req.app.locals.wsService.broadcast('votes:updated', {
          sessionId,
          voteCount: result.voteCount
        });
      }

      res.json(result);
    } catch (error: any) {
      console.error('Error adding vote:', error);
      if (error.message === 'User has already voted for this session') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to add vote' });
    }
  }

  async removeVote(req: Request, res: Response) {
    try {
      const { id: sessionId } = req.params;
      const { userId } = req.body;

      const result = await votingService.removeVote(sessionId, userId);

      // Broadcast to WebSocket clients
      if (req.app.locals.wsService) {
        req.app.locals.wsService.broadcast('votes:updated', {
          sessionId,
          voteCount: result.voteCount
        });
      }

      res.json(result);
    } catch (error: any) {
      console.error('Error removing vote:', error);
      if (error.message === 'Vote not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to remove vote' });
    }
  }

  async getUserVotes(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const votes = await votingService.getUserVotes(userId);
      res.json({ votes });
    } catch (error) {
      console.error('Error fetching user votes:', error);
      res.status(500).json({ error: 'Failed to fetch user votes' });
    }
  }
}
