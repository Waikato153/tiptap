// lib/store.ts
import { configureStore } from '@reduxjs/toolkit';
import fileInfoReducer from './slices/fileInfoSlice';

export const store = configureStore({
  reducer: {
    fileInfo: fileInfoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;