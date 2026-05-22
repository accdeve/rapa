export type SessionType = 'brainstorming' | 'direct_voting';
export type RoomStatus = 'waiting' | 'active' | 'voting' | 'results' | 'finished';
export type QuestionStatus = 'pending' | 'input' | 'grouping' | 'voting' | 'done';
export type SessionPhase = 'waiting' | 'input' | 'grouping' | 'voting' | 'results';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}