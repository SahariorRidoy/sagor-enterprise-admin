import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { User } from "@/types/User";



type TAuthState = {
  user: User | null;
  token: string | null;
};

const initialState: TAuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      // Handle both direct API response and NextAuth session format
      if (action.payload.user && action.payload.accessToken) {
        // Direct API response format
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', action.payload.accessToken);
        }
      } else {
        // NextAuth session format or legacy format
        state.user = action.payload;
        // Don't overwrite existing token if not provided
        if (action.payload.accessToken) {
          state.token = action.payload.accessToken;
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', action.payload.accessToken);
          }
        }
      }
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }
    },
  },
});

// Exporting actions
export const { setUser, logoutUser } = authSlice.actions;


// Export Selector
export const selectCurrentToken = (state: RootState) =>
  state.auth.token;
export const selectCurrentUser = (state: RootState) =>
  state.auth.user;

// Exporting default reducers
export default authSlice.reducer;