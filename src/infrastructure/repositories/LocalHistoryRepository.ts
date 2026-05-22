import type { Room } from '@/domain/models/Room';

export class LocalHistoryRepository {
  /**
   * Save or update a room in the Game Master's local history (recentRoomsGM).
   * Uses a fast Map index lookup for absolute time efficiency (O(1) search and replace).
   */
  saveOrUpdateGMRoom(room: Room): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('recentRoomsGM');
      let roomsList: any[] = [];
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          roomsList = parsed;
        }
      }

      // Build a lookup map of id -> array index for highly efficient O(1) deduplication
      const map = new Map<string, number>();
      for (let i = 0; i < roomsList.length; i++) {
        if (roomsList[i]?.id) {
          map.set(roomsList[i].id, i);
        }
      }

      const roomEntry = {
        id: room.id,
        code: room.code,
        title: room.title,
        gmId: room.gmId,
        sessionType: room.sessionType,
        status: room.status || 'waiting',
        createdAt: room.createdAt || new Date().toISOString()
      };

      const existingIdx = map.get(room.id);
      if (existingIdx !== undefined) {
        // Remove existing element to shift the updated one to the top
        roomsList.splice(existingIdx, 1);
      }
      roomsList.unshift(roomEntry);

      if (roomsList.length > 10) {
        roomsList = roomsList.slice(0, 10);
      }

      localStorage.setItem('recentRoomsGM', JSON.stringify(roomsList));
    } catch (err) {
      console.error('Failed to save GM room history:', err);
    }
  }

  /**
   * Save or update a room in the Participant's local history (recentRoomsParticipant).
   */
  saveOrUpdateParticipantRoom(room: Room): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('recentRoomsParticipant');
      let roomsList: any[] = [];
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          roomsList = parsed;
        }
      }

      // Build a lookup map of code -> array index for O(1) deduplication
      const map = new Map<string, number>();
      for (let i = 0; i < roomsList.length; i++) {
        const key = roomsList[i]?.code || roomsList[i]?.id;
        if (key) {
          map.set(key, i);
        }
      }

      const roomEntry = {
        code: room.code,
        title: room.title,
        joinedAt: new Date().toISOString()
      };

      const existingIdx = map.get(room.code);
      if (existingIdx !== undefined) {
        roomsList.splice(existingIdx, 1);
      }
      roomsList.unshift(roomEntry);

      if (roomsList.length > 5) {
        roomsList = roomsList.slice(0, 5);
      }

      localStorage.setItem('recentRoomsParticipant', JSON.stringify(roomsList));
    } catch (err) {
      console.error('Failed to save Participant room history:', err);
    }
  }
}
