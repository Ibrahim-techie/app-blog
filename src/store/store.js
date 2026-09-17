import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../redux/authSlice";
import systemSlice from "../redux/systemSlice";
const store = configureStore({
  reducer: {
    auth: authSlice,
    system: systemSlice,
  },
});

export default store;
