import { useState, useEffect } from "react";

import authService from "./services/auth.service";
import { useDispatch } from "react-redux";
import { login, logout } from "./redux/authSlice";

function App() {
  const [loading, setloading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    authService
      .getCurrentUser()
      .then((user) => {
        if (user) {
          dispatch(login(user));
        } else {
          dispatch(logout());
        }
      })
      .catch((err) => {
        console.log("error in getting user info :: App.jsx::Line12::", err);
      })
      .finally(() => {
        setloading(false);
      });
  });

  if (loading) {
    return (
      <div>
        <h1>.....loading</h1>
      </div>
    );
  }

  return (
    <div className=" bg-black h-full text-2xl text-white">
      <div>Header</div>
      <div>Outlet</div>
      <div>Footer</div>
    </div>
  );
}

export default App;
