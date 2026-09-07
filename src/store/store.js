import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../redux/authSlice";
import postSlice from "../redux/postSlice";
import systemSlice from "../redux/systemSlice";
const store = configureStore({
  reducer: {
    auth: authSlice,
    post: postSlice,
    system: systemSlice,
  },
});

export default store;
