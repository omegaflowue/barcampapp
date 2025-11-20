// Infrastructure types
export type InfrastructureType = 'BEAMER' | 'FLIPCHART' | 'WHITEBOARD' | 'MODERATION_KIT';

export interface Infrastructure {
  type: InfrastructureType;
  required: boolean;
}

// Event status
export type EventStatus = 'PREPARATION' | 'OPEN_FOR_SUBMISSIONS' | 'VOTING' | 'SCHEDULING' | 'RUNNING' | 'ARCHIVED';

// Session status
export type SessionStatus = 'CREATED' | 'VOTING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';

// Models
export interface Event {
  id: string;
  name: string;
  date: Date | string;
  status: EventStatus;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface Room {
  id: string;
  event_id: string;
  name: string;
  capacity: number;
  infrastructure: InfrastructureType[];
  created_at: Date | string;
}

export interface TimeSlot {
  id: string;
  event_id: string;
  start_time: Date | string;
  end_time: Date | string;
  created_at: Date | string;
}

export interface Session {
  id: string;
  event_id: string;
  title: string;
  description: string;
  presenter: string;
  duration: number;
  infrastructure: InfrastructureType[];
  vote_count: number;
  status: SessionStatus;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface SessionWithSchedule extends Session {
  scheduledSlot?: {
    roomId: string;
    roomName: string;
    timeSlotId: string;
    startTime: Date | string;
    endTime: Date | string;
  };
}

export interface CreateSessionRequest {
  title: string;
  description: string;
  presenter: string;
  duration: number;
  infrastructure: InfrastructureType[];
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
  startTime: Date | string;
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
  timestamp: Date | string;
}

// Icon mapping for infrastructure
export const InfrastructureIcons: Record<InfrastructureType, string> = {
  BEAMER: '🎥',
  FLIPCHART: '📊',
  WHITEBOARD: '🖊️',
  MODERATION_KIT: '🎨'
};

export const InfrastructureLabels: Record<InfrastructureType, { de: string; en: string }> = {
  BEAMER: { de: 'Beamer', en: 'Projector' },
  FLIPCHART: { de: 'Flipchart', en: 'Flipchart' },
  WHITEBOARD: { de: 'Whiteboard', en: 'Whiteboard' },
  MODERATION_KIT: { de: 'Moderationskoffer', en: 'Moderation Kit' }
};
