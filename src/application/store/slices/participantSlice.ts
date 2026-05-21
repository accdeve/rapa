import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RoomParticipant } from '@/domain/models';

interface ParticipantState {
  participants: RoomParticipant[];
  currentParticipantId: string | null;
}

const initialState: ParticipantState = {
  participants: [],
  currentParticipantId: null,
};

const participantSlice = createSlice({
  name: 'participant',
  initialState,
  reducers: {
    setParticipants(state, action: PayloadAction<RoomParticipant[]>) {
      state.participants = action.payload;
    },
    addParticipant(state, action: PayloadAction<RoomParticipant>) {
      state.participants.push(action.payload);
    },
    removeParticipant(state, action: PayloadAction<string>) {
      state.participants = state.participants.filter((p) => p.id !== action.payload);
    },
    setCurrentParticipant(state, action: PayloadAction<string | null>) {
      state.currentParticipantId = action.payload;
    },
    toggleMute(state, action: PayloadAction<string>) {
      const participant = state.participants.find((p) => p.id === action.payload);
      if (participant) {
        participant.isMuted = !participant.isMuted;
        participant.updatedAt = new Date();
      }
    },
  },
});

export const {
  setParticipants,
  addParticipant,
  removeParticipant,
  setCurrentParticipant,
  toggleMute,
} = participantSlice.actions;

export default participantSlice.reducer;

export const selectAllParticipants = (state: { participant: ParticipantState }) => state.participant.participants;
export const selectCurrentParticipantId = (state: { participant: ParticipantState }) => state.participant.currentParticipantId;