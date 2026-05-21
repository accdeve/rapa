import type { BaseEntity, SessionType, RoomStatus } from './common';

export interface Room extends BaseEntity {
  code: string;
  title: string;
  gmId: string;
  sessionType: SessionType;
  status: RoomStatus;
  maxParticipants: number;
}

export interface RoomCreateInput {
  title: string;
  sessionType: SessionType;
  maxParticipants: number;
}

export type RoomUpdateInput = Partial<Omit<Room, 'id' | 'code' | 'gmId' | 'createdAt' | 'updatedAt'>>;

export interface RoomParticipant extends BaseEntity {
  roomId: string;
  avatarSeed: string;
  isMuted: boolean;
}

export interface RoomWithParticipantCount extends Room {
  participantCount: number;
}