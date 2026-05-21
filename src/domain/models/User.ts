import type { BaseEntity } from './common';

export interface User extends BaseEntity {
  email: string;
  fullName: string;
}

export interface UserCreateInput {
  email: string;
  password: string;
  fullName: string;
}

export type UserUpdateInput = Partial<Omit<User, 'id' | 'email' | 'createdAt' | 'updatedAt'>>;

export interface Participant {
  id: string;
  roomId: string;
  avatarSeed: string;
  joinedAt: Date;
  isMuted: boolean;
}