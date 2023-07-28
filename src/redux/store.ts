import { configureStore, ThunkAction } from "@reduxjs/toolkit";
import user from "./userSlice";
import { AnyAction } from "redux";

export const store = configureStore({
  reducer: {
    user
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;
