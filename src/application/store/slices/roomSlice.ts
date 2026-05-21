import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Room, RoomStatus, RoomCreateInput } from '@/domain/models';
import { roomService } from '@/domain/services';

interface RoomState {
  currentRoom: Room | null;
  rooms: Room[];
  loading: boolean;
  error: string | null;
}

const initialState: RoomState = {
  currentRoom: null,
  rooms: [],
  loading: false,
  error: null,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setCurrentRoom(state, action: PayloadAction<Room | null>) {
      state.currentRoom = action.payload;
    },
    setRooms(state, action: PayloadAction<Room[]>) {
      state.rooms = action.payload;
    },
    addRoom(state, action: PayloadAction<Room>) {
      state.rooms.push(action.payload);
    },
    updateRoomStatus(state, action: PayloadAction<{ id: string; status: RoomStatus }>) {
      const room = state.rooms.find((r) => r.id === action.payload.id);
      if (room) {
        room.status = action.payload.status;
        room.updatedAt = new Date();
      }
      if (state.currentRoom?.id === action.payload.id) {
        state.currentRoom.status = action.payload.status;
        state.currentRoom.updatedAt = new Date();
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearRoom(state) {
      state.currentRoom = null;
    },
  },
});

export const {
  setCurrentRoom,
  setRooms,
  addRoom,
  updateRoomStatus,
  setLoading,
  setError,
  clearRoom,
} = roomSlice.actions;

export default roomSlice.reducer;

export const selectCurrentRoom = (state: { room: RoomState }) => state.room.currentRoom;
export const selectAllRooms = (state: { room: RoomState }) => state.room.rooms;
export const selectRoomLoading = (state: { room: RoomState }) => state.room.loading;
export const selectRoomError = (state: { room: RoomState }) => state.room.error;

export const createRoom = (input: RoomCreateInput, gmId: string): Room => {
  return roomService.createRoom(input, gmId);
};