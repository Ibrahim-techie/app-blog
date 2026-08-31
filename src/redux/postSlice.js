import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  all: [],
  mypost: [],
};
const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    allPosts: (state, action) => {
      state.all = action.payload;
    },
    myposts: (state, action) => {
      state.mypost = action.payload;
    },
  },
});

export const { allPosts, myposts } = postSlice.actions;

export default postSlice.reducer;
