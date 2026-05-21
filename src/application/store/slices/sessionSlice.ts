import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SessionPhase, RoomParticipant } from '@/domain/models';
import { sessionService } from '@/domain/services';

interface SessionState {
  phase: SessionPhase;
  participants: RoomParticipant[];
  elapsedTime: number;
  isConnected: boolean;
}

const initialState: SessionState = {
  phase: 'waiting',
  participants: [],
  elapsedTime: 0,
  isConnected: false,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setPhase(state, action: PayloadAction<SessionPhase>) {
      state.phase = action.payload;
    },
    addParticipant(state, action: PayloadAction<RoomParticipant>) {
      state.participants.push(action.payload);
    },
    removeParticipant(state, action: PayloadAction<string>) {
      state.participants = state.participants.filter((p) => p.id !== action.payload);
    },
    setParticipants(state, action: PayloadAction<RoomParticipant[]>) {
      state.participants = action.payload;
    },
    setElapsedTime(state, action: PayloadAction<number>) {
      state.elapsedTime = action.payload;
    },
    setConnected(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
    },
    resetSession(state) {
      state.phase = 'waiting';
      state.participants = [];
      state.elapsedTime = 0;
      state.isConnected = false;
    },
  },
});

export const {
  setPhase,
  addParticipant,
  removeParticipant,
  setParticipants,
  setElapsedTime,
  setConnected,
  resetSession,
} = sessionSlice.actions;

export default sessionSlice.reducer;

export const selectPhase = (state: { session: SessionState }) => state.session.phase;
export const selectParticipants = (state: { session: SessionState }) => state.session.participants;
export const selectParticipantCount = (state: { session: SessionState }) => state.session.participants.length;
export const selectElapsedTime = (state: { session: SessionState }) => state.session.elapsedTime;
export const selectIsConnected = (state: { session: SessionState }) => state.session.isConnected;