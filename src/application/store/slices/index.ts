export { default as roomReducer } from './roomSlice';
export { default as sessionReducer } from './sessionSlice';
export { default as votingReducer } from './votingSlice';
export { default as participantReducer } from './participantSlice';
export { default as uiReducer } from './uiSlice';

export * from './roomSlice';
export * from './votingSlice';

import {
  setPhase,
  addParticipant,
  removeParticipant,
  setParticipants,
  setElapsedTime,
  setConnected,
  resetSession,
  selectPhase,
  selectParticipants,
  selectParticipantCount,
  selectElapsedTime,
  selectIsConnected,
} from './sessionSlice';

export { setPhase, addParticipant, removeParticipant, setParticipants, setElapsedTime, setConnected, resetSession };
export { selectPhase, selectParticipants, selectParticipantCount, selectElapsedTime, selectIsConnected };

import {
  setCurrentParticipant,
  toggleMute,
  selectAllParticipants,
  selectCurrentParticipantId,
} from './participantSlice';

export { setCurrentParticipant, toggleMute };
export { selectAllParticipants, selectCurrentParticipantId };

import {
  setActiveTab,
  setShowSpotlight,
  setGMLoggedIn,
  nextSpotlightStep,
  openModal,
  closeModal,
  selectActiveTab,
  selectShowSpotlight,
  selectIsGMLoggedIn,
  selectModalOpen,
} from './uiSlice';

export { setActiveTab, setShowSpotlight, setGMLoggedIn, nextSpotlightStep, openModal, closeModal };
export { selectActiveTab, selectShowSpotlight, selectIsGMLoggedIn, selectModalOpen };