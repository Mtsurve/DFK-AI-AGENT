import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
  authData: JSON.parse(localStorage.getItem("authData")) || null,
  isAuthenticated: !!localStorage.getItem("authData"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.authData = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("authData", JSON.stringify(action.payload));

      // Save token in Cookies
      if (action.payload.token) {
        Cookies.set("defi-auth-token", action.payload.token, {
          secure: true,
          sameSite: "Strict",
        });
      }
    },
    logout(state) {
      state.authData = null;
      state.isAuthenticated = false;
      localStorage.removeItem("authData");

      // Remove token from Cookies on logout
      Cookies.remove("defi-auth-token");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
