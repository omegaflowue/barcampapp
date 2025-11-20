// Infrastructure types
export type InfrastructureType = 'BEAMER' | 'FLIPCHART' | 'WHITEBOARD' | 'MODERATION_KIT';

export interface Infrastructure {
  type: InfrastructureType;
  required: boolean;
}

// TimeSlot types
export type TimeSlotType = 'SESSION' | 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'BREAK';

// Event status
export type EventStatus = 'PREPARATION' | 'OPEN_FOR_SUBMISSIONS' | 'VOTING' | 'SCHEDULING' | 'RUNNING' | 'ARCHIVED';

// Session status
export type SessionStatus = 'CREATED' | 'VOTING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';

// Database Models
export interface Event {
  id: string;
  name: string;
  date: Date;
  status: EventStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Room {
  id: string;
  event_id: string;
  name: string;
  capacity: number;
  infrastructure: InfrastructureType[];
  created_at: Date;
}

export interface TimeSlot {
  id: string;
  event_id: string;
  start_time: Date;
  end_time: Date;
  type: TimeSlotType;
  label?: string;
  created_at: Date;
}

export interface Session {
  id: string;
  event_id: string;
  title: string;
  description: string;
  presenter: string;
  duration: number; // in minutes
  infrastructure: InfrastructureType[];
  vote_count: number;
  status: SessionStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Vote {
  id: string;
  session_id: string;
  user_id: string | null;
  timestamp: Date;
}

export interface Schedule {
  id: string;
  session_id: string;
  room_id: string;
  time_slot_id: string;
  created_at: Date;
}

// API Request/Response types
export interface CreateEventRequest {
  name: string;
  date: string;
}

export interface CreateRoomRequest {
  name: string;
  capacity: number;
  infrastructure: InfrastructureType[];
}

export interface CreateTimeSlotRequest {
  start_time: string;
  end_time: string;
  type: TimeSlotType;
  label?: string;
}

export interface CreateSessionRequest {
  title: string;
  description: string;
  presenter: string;
  infrastructure: InfrastructureType[];
}

export interface UpdateSessionRequest {
  title?: string;
  description?: string;
  presenter?: string;
  infrastructure?: InfrastructureType[];
}

export interface VoteRequest {
  userId?: string;
}

export interface SessionWithSchedule extends Session {
  scheduledSlot?: {
    roomId: string;
    roomName: string;
    timeSlotId: string;
    startTime: Date;
    endTime: Date;
  };
}

export interface OptimizationMetrics {
  voteSatisfaction: number;
  conflicts: number;
  roomUtilization: number;
}

export interface ScheduleProposal {
  sessionId: string;
  roomId: string;
  timeSlotId: string;
  startTime: Date;
}

export interface OptimizeScheduleResponse {
  status: 'success' | 'error';
  schedule: ScheduleProposal[];
  metrics: OptimizationMetrics;
}

// WebSocket message types
export type WebSocketMessageType =
  | 'session:new'
  | 'session:updated'
  | 'session:deleted'
  | 'votes:updated'
  | 'schedule:published'
  | 'event:status_changed';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
  timestamp: Date;
}
