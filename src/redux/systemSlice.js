import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: "light",
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