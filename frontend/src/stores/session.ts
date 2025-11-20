import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { SessionWithSchedule, CreateSessionRequest } from '../types';
import { sessionsAPI, votingAPI } from '../services/api';
import { wsService } from '../services/websocket';

export const useSessionStore = defineStore('session', () => {
  const sessions = ref<SessionWithSchedule[]>([]);
  const userVotes = ref<Set<string>>(new Set());
  const userId = ref<string>(localStorage.getItem('userId') || generateUserId());
  const loading = ref(false);
  const error = ref<string | null>(null);

  const sortedSessions = computed(() => {
    return [...sessions.value].sort((a, b) => b.vote_count - a.vote_count);
  });

  function generateUserId(): string {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', id);
    return id;
  }

  async function fetchSessions(eventId: string) {
    loading.value = true;
    error.value = null;
    try {
      const response = await sessionsAPI.getAll(eventId);
      sessions.value = response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch sessions';
      console.error('Error fetching sessions:', err);
    } finally {
      loading.value = false;
    }
  }

  async function createSession(eventId: string, data: CreateSessionRequest) {
    loading.value = true;
    error.value = null;
    try {
      const response = await sessionsAPI.create(eventId, data);
      // Will be added via WebSocket
      return response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to create session';
      console.error('Error creating session:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateSession(id: string, data: Partial<CreateSessionRequest>) {
    try {
      const response = await sessionsAPI.update(id, data);
      // Will be updated via WebSocket
      return response.data;
    } catch (err: any) {
      console.error('Error updating session:', err);
      throw err;
    }
  }

  async function deleteSession(id: string) {
    try {
      await sessionsAPI.delete(id);
      // Will be removed via WebSocket
    } catch (err: any) {
      console.error('Error deleting session:', err);
      throw err;
    }
  }

  async function vote(sessionId: string) {
    if (userVotes.value.has(sessionId)) {
      return;
    }

    try {
      await votingAPI.addVote(sessionId, userId.value);
      userVotes.value.add(sessionId);
      // Vote count will be updated via WebSocket
    } catch (err: any) {
      console.error('Error voting:', err);
      throw err;
    }
  }

  async function unvote(sessionId: string) {
    if (!userVotes.value.has(sessionId)) {
      return;
    }

    try {
      await votingAPI.removeVote(sessionId, userId.value);
      userVotes.value.delete(sessionId);
      // Vote count will be updated via WebSocket
    } catch (err: any) {
      console.error('Error removing vote:', err);
      throw err;
    }
  }

  function hasVoted(sessionId: string): boolean {
    return userVotes.value.has(sessionId);
  }

  // WebSocket handlers
  function setupWebSocket() {
    wsService.on('session:new', (session: SessionWithSchedule) => {
      sessions.value.push(session);
    });

    wsService.on('session:updated', (updatedSession: SessionWithSchedule) => {
      const index = sessions.value.findIndex((s) => s.id === updatedSession.id);
      if (index !== -1) {
        sessions.value[index] = updatedSession;
      }
    });

    wsService.on('session:deleted', ({ id }: { id: string }) => {
      const index = sessions.value.findIndex((s) => s.id === id);
      if (index !== -1) {
        sessions.value.splice(index, 1);
      }
    });

    wsService.on('votes:updated', ({ sessionId, voteCount }: { sessionId: string; voteCount: number }) => {
      const session = sessions.value.find((s) => s.id === sessionId);
      if (session) {
        session.vote_count = voteCount;
      }
    });
  }

  return {
    sessions,
    sortedSessions,
    userVotes,
    userId,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    vote,
    unvote,
    hasVoted,
    setupWebSocket
  };
});
