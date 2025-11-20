import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export class VotingService {
  async addVote(sessionId: string, userId?: string): Promise<{ voteCount: number }> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if user already voted for this session
      if (userId) {
        const existingVote = await client.query(
          'SELECT id FROM votes WHERE session_id = $1 AND user_id = $2',
          [sessionId, userId]
        );

        if (existingVote.rows.length > 0) {
          await client.query('ROLLBACK');
          throw new Error('User has already voted for this session');
        }
      }

      // Insert vote
      const voteId = userId || uuidv4(); // Use UUID if no userId provided
      await client.query(
        'INSERT INTO votes (session_id, user_id) VALUES ($1, $2)',
        [sessionId, voteId]
      );

      // Update vote count
      const updateResult = await client.query(
        `UPDATE sessions
         SET vote_count = vote_count + 1
         WHERE id = $1
         RETURNING vote_count`,
        [sessionId]
      );

      await client.query('COMMIT');

      return { voteCount: updateResult.rows[0].vote_count };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async removeVote(sessionId: string, userId?: string): Promise<{ voteCount: number }> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Delete vote
      const deleteResult = await client.query(
        'DELETE FROM votes WHERE session_id = $1 AND user_id = $2 RETURNING id',
        [sessionId, userId || uuidv4()]
      );

      if (deleteResult.rowCount === 0) {
        await client.query('ROLLBACK');
        throw new Error('Vote not found');
      }

      // Update vote count
      const updateResult = await client.query(
        `UPDATE sessions
         SET vote_count = GREATEST(vote_count - 1, 0)
         WHERE id = $1
         RETURNING vote_count`,
        [sessionId]
      );

      await client.query('COMMIT');

      return { voteCount: updateResult.rows[0].vote_count };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getVoteCount(sessionId: string): Promise<number> {
    const result = await pool.query(
      'SELECT vote_count FROM sessions WHERE id = $1',
      [sessionId]
    );

    return result.rows[0]?.vote_count || 0;
  }

  async getUserVotes(userId: string): Promise<string[]> {
    const result = await pool.query(
      'SELECT session_id FROM votes WHERE user_id = $1',
      [userId]
    );

    return result.rows.map(row => row.session_id);
  }
}
