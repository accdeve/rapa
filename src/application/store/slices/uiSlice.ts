import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  activeTab: number;
  showSpotlight: boolean;
  currentSpotlightStep: number;
  isGMLoggedIn: boolean;
  modalOpen: string | null;
}

const initialState: UiState = {
  activeTab: 0,
  showSpotlight: false,
  currentSpotlightStep: 0,
  isGMLoggedIn: false,
  modalOpen: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<number>) {
      state.activeTab = action.payload;
    },
    setShowSpotlight(state, action: PayloadAction<boolean>) {
      state.showSpotlight = action.payload;
    },
    setGMLoggedIn(state, action: PayloadAction<boolean>) {
      state.isGMLoggedIn = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('isGMLoggedIn', String(action.payload));
      }
    },
    nextSpotlightStep(state) {
      if (state.currentSpotlightStep < 3) {
        state.currentSpotlightStep += 1;
      } else {
        state.showSpotlight = false;
      }
    },
    openModal(state, action: PayloadAction<string>) {
      state.modalOpen = action.payload;
    },
    closeModal(state) {
      state.modalOpen = null;
    },
  },
});

export const {
  setActiveTab,
  setShowSpotlight,
  setGMLoggedIn,
  nextSpotlightStep,
  openModal,
  closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;

export const selectActiveTab = (state: { ui: UiState }) => state.ui.activeTab;
export const selectShowSpotlight = (state: { ui: UiState }) => state.ui.showSpotlight;
export const selectIsGMLoggedIn = (state: { ui: UiState }) => state.ui.isGMLoggedIn;
export const selectModalOpen = (state: { ui: UiState }) => state.ui.modalOpen;