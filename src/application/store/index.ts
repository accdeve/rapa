import { configureStore } from '@reduxjs/toolkit';
import roomReducer from './slices/roomSlice';
import sessionReducer from './slices/sessionSlice';
import votingReducer from './slices/votingSlice';
import participantReducer from './slices/participantSlice';
import uiReducer from './slices/uiSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      room: roomReducer,
      session: sessionReducer,
      voting: votingReducer,
      participant: participantReducer,
      ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];