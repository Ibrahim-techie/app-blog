import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  all: [],
  mypost: [],
};

const postSlice = createSlice({
  name: "posts",
  initialState,

  reducers: {
    // First fetch
    allPosts: (state, action) => {
      state.all = action.payload;
    },

    // Next page
    addPosts: (state, action) => {
      state.all.push(...action.payload);
    },

    //fetched myposts with userData.$id ===post.userID
    myposts: (state, action) => {
      state.mypost = action.payload;
    },
  },
});

export const {
  allPosts,
  addPosts,
  myposts,
  setCursor,
  setHasMore,
  setLoading,
} = postSlice.actions;

export default postSlice.reducer;
