import { useState, useEffect } from "react";

import authService from "./services/auth.service";
import { useDispatch } from "react-redux";
import { login, logout } from "./redux/authSlice";
import { Header,Footer, Loader } from "./components";
import { Outlet } from "react-router-dom";


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
        <Loader/>
      </div>
    );
  }
  return !loading ? (
    <div className="min-h-screen flex flex-wrap content-between bg-gray-400">
      <div className="w-full block">
        <Header />
        <main>
      <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  ) : null;
}

export default App;
