import type { Room, RoomCreateInput, RoomUpdateInput, RoomParticipant } from '@/domain/models/Room';
import type { Question } from '@/domain/models/Question';
import type { Vote } from '@/domain/models/Voting';
import type { CanvasItem } from '@/domain/models/Canvas';

export interface IRoomRepository {
  create(input: RoomCreateInput & { code: string; gmId: string }): Promise<Room>;
  findById(id: string): Promise<Room | null>;
  findByCode(code: string): Promise<Room | null>;
  update(id: string, input: RoomUpdateInput): Promise<Room>;
  delete(id: string): Promise<void>;
  listActive(): Promise<Room[]>;
  listByGm(gmId: string): Promise<Room[]>;
  subscribeToRoom(id: string, callback: (room: Room) => void): () => void;
}

export interface IParticipantRepository {
  add(participant: { roomId: string; userId?: string; avatarSeed: string }): Promise<RoomParticipant>;
  remove(id: string): Promise<void>;
  findByRoom(roomId: string): Promise<RoomParticipant[]>;
  updateMute(id: string, isMuted: boolean): Promise<void>;
  subscribeToParticipants(roomId: string, callback: (participants: RoomParticipant[]) => void): () => void;
}

export interface IQuestionRepository {
  create(question: { roomId: string; participantId?: string; content: string }): Promise<Question>;
  findByRoom(roomId: string): Promise<Question[]>;
  updateStatus(id: string, status: Question['status']): Promise<Question>;
  delete(id: string): Promise<void>;
  subscribeToQuestions(roomId: string, callback: (questions: Question[]) => void): () => void;
}

export interface IVoteRepository {
  cast(vote: { questionId: string; participantId: string }): Promise<Vote>;
  findByQuestion(questionId: string): Promise<Vote[]>;
  countByQuestion(questionId: string): Promise<number>;
}

export interface ICanvasRepository {
  getItems(roomId: string): Promise<CanvasItem[]>;
  saveItem(item: Omit<CanvasItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CanvasItem>;
  updateItemPos(id: string, x: number, y: number): Promise<void>;
  updateItemParent(id: string, parentId: string): Promise<void>;
  updateItemContent(id: string, content: string): Promise<void>;
  deleteItem(id: string): Promise<void>;
  subscribeToCanvas(roomId: string, callback: (items: CanvasItem[]) => void): () => void;
}
