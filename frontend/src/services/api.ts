import axios from 'axios';
import type {
  Event,
  Session,
  SessionWithSchedule,
  CreateSessionRequest,
  CreateRoomRequest,
  CreateTimeSlotRequest,
  Room,
  TimeSlot,
  OptimizeScheduleResponse,
  ScheduleProposal
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Events API
export const eventsAPI = {
  getAll: () => api.get<Event[]>('/events'),
  getById: (id: string) => api.get<Event>(`/events/${id}`),
  create: (data: { name: string; date: string }) => api.post<Event>('/events', data),
  updateStatus: (id: string, status: string) => api.patch<Event>(`/events/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/events/${id}`)
};

// Sessions API
export const sessionsAPI = {
  getAll: (eventId: string) => api.get<SessionWithSchedule[]>(`/events/${eventId}/sessions`),
  getById: (id: string) => api.get<SessionWithSchedule>(`/sessions/${id}`),
  create: (eventId: string, data: CreateSessionRequest) => api.post<Session>(`/events/${eventId}/sessions`, data),
  update: (id: string, data: Partial<CreateSessionRequest>) => api.put<Session>(`/sessions/${id}`, data),
  delete: (id: string) => api.delete(`/sessions/${id}`)
};

// Voting API
export const votingAPI = {
  addVote: (sessionId: string, userId?: string) => api.post<{ voteCount: number }>(`/sessions/${sessionId}/vote`, { userId }),
  removeVote: (sessionId: string, userId?: string) => api.delete(`/sessions/${sessionId}/vote`, { data: { userId } }),
  getUserVotes: (userId: string) => api.get<{ votes: string[] }>(`/users/${userId}/votes`)
};

// Rooms API
export const roomsAPI = {
  getAll: (eventId: string) => api.get<Room[]>(`/events/${eventId}/rooms`),
  create: (eventId: string, data: CreateRoomRequest) =>
    api.post<Room>(`/events/${eventId}/rooms`, data),
  delete: (id: string) => api.delete(`/rooms/${id}`)
};

// Time Slots API
export const timeSlotsAPI = {
  getAll: (eventId: string) => api.get<TimeSlot[]>(`/events/${eventId}/time-slots`),
  create: (eventId: string, data: CreateTimeSlotRequest) =>
    api.post<TimeSlot>(`/events/${eventId}/time-slots`, data),
  delete: (id: string) => api.delete(`/time-slots/${id}`)
};

// Schedule API
export const scheduleAPI = {
  get: (eventId: string) => api.get(`/events/${eventId}/schedule`),
  optimize: (eventId: string) => api.post<OptimizeScheduleResponse>(`/events/${eventId}/schedule/optimize`),
  publish: (eventId: string, schedule: ScheduleProposal[]) =>
    api.post(`/events/${eventId}/schedule/publish`, { schedule }),
  clear: (eventId: string) => api.delete(`/events/${eventId}/schedule`)
};

export default api;
