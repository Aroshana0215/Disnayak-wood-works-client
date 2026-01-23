import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Redux/features/auth/authSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
