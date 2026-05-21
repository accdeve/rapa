import type { Room, RoomCreateInput, RoomParticipant } from '@/domain/models';

export interface IRoomService {
  createRoom(input: RoomCreateInput, gmId: string): Room;
  canJoinRoom(room: Room, currentCount: number): boolean;
  updateStatus(room: Room, status: Room['status']): Room;
  findByCode(rooms: Room[], code: string): Room | undefined;
  filterByStatus(rooms: Room[], status: Room['status']): Room[];
  sortByDate(rooms: Room[], ascending?: boolean): Room[];
}

export interface IVotingService {
  countVotes(votes: { groupId: string }[], groupIds: string[]): Map<string, number>;
  calculatePercentages(counts: Map<string, number>, total: number): Map<string, number>;
  getWinner(groupVotes: Map<string, number>, groupNames: Map<string, string>): { groupId: string; groupName: string; count: number } | null;
  hasTie(groupVotes: Map<string, number>): boolean;
}

export interface ISessionService {
  createParticipant(roomId: string, avatarSeed: string): RoomParticipant;
  canStartSession(participantCount: number, minRequired: number): boolean;
  calculatePhaseProgress(phase: string, elapsedTime: number): number;
}

export interface ICodeGenerator {
  generate(length?: number): string;
  validate(code: string, length?: number): boolean;
}

export interface IPaginationService<T> {
  paginate(items: T[], page: number, limit: number): { items: T[]; total: number; totalPages: number };
  createCursor(items: T[], page: number, limit: number): string | null;
}