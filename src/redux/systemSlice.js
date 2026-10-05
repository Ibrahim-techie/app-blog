import { createSlice } from "@reduxjs/toolkit";

// Start from the saved choice so the first render already matches the class
// index.html put on <html>. Storage can throw (private mode, blocked site
// data), in which case light is the default as before.
function savedTheme() {
  try {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

const initialState = {
  theme: savedTheme(),
};

const systemSlice = createSlice({
  name: "system",
  initialState,
  reducers: {
    themeSwitch: (state, action) => {
      state.theme = action.payload;
    },
  },
});


export const {themeSwitch} =systemSlice.actions

export default systemSlice.reducer;
