import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  activeTab: number;
  showSpotlight: boolean;
  currentSpotlightStep: number;
  isGMLoggedIn: boolean;
}

const initialState: UiState = {
  activeTab: 0,
  showSpotlight: true,
  currentSpotlightStep: 0,
  isGMLoggedIn: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<number>) => {
      state.activeTab = action.payload;
    },
    setShowSpotlight: (state, action: PayloadAction<boolean>) => {
      state.showSpotlight = action.payload;
    },
    setGMLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isGMLoggedIn = action.payload;
    },
    nextSpotlightStep: (state) => {
      if (state.currentSpotlightStep < 3) {
        state.currentSpotlightStep += 1;
      } else {
        state.showSpotlight = false;
      }
    },
  },
});

export const { setActiveTab, setShowSpotlight, setGMLoggedIn, nextSpotlightStep } = uiSlice.actions;
export default uiSlice.reducer;
