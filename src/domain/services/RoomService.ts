import type { Room, RoomCreateInput, RoomStatus } from '@/domain/models';
import type { IRoomService } from '@/domain/interfaces';
import { generateRoomCode } from '@/utils/codeGenerator';

export class RoomService implements IRoomService {
  createRoom(input: RoomCreateInput, gmId: string): Room {
    const now = new Date();
    return {
      id: crypto.randomUUID(),
      code: generateRoomCode(),
      title: input.title,
      gmId,
      sessionType: input.sessionType,
      status: 'waiting',
      maxParticipants: input.maxParticipants,
      createdAt: now,
      updatedAt: now,
    };
  }

  canJoinRoom(room: Room, currentCount: number): boolean {
    return room.status === 'waiting' && currentCount < room.maxParticipants;
  }

  updateStatus(room: Room, status: RoomStatus): Room {
    return { ...room, status, updatedAt: new Date() };
  }

  findByCode(rooms: Room[], code: string): Room | undefined {
    const sortedRooms = [...rooms].sort((a, b) => a.code.localeCompare(b.code));
    let left = 0;
    let right = sortedRooms.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midCode = sortedRooms[mid].code;

      if (midCode === code) return sortedRooms[mid];
      if (midCode < code) left = mid + 1;
      else right = mid - 1;
    }

    return undefined;
  }

  filterByStatus(rooms: Room[], status: RoomStatus): Room[] {
    return rooms.filter(room => room.status === status);
  }

  sortByDate(rooms: Room[], ascending = false): Room[] {
    return [...rooms].sort((a, b) => {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return ascending ? -diff : diff;
    });
  }
}

export const roomService = new RoomService();