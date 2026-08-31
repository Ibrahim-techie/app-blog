import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../redux/authSlice";
import postSlice from "../redux/postSlice";
const store = configureStore({
  reducer: {
    auth: authSlice,
    post: postSlice,
  },
});

export default store;
