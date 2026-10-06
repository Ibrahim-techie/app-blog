import { useState, useEffect, useCallback } from "react";

import authService from "./services/auth.service";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "./redux/authSlice";
import { Loader } from "./components";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./components/shell/Sidebar";
import TopBar from "./components/shell/TopBar";
import AuthShell from "./components/shell/AuthShell";
import useTheme from "./customHooks/useTheme";
import useProfileSync from "./customHooks/useProfileSync";
import VerifyEmailNotice from "./components/VerifyEmailNotice";

const AUTH_PAGES = ["/login", "/signup", "/forgot-password", "/reset-password"];

function App() {
  const [loading, setloading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const user = useSelector((state) => state.auth.userData);

  // Mounted for every route, so the theme class is applied everywhere —
  // including the sign-in pages, which don't render the theme switch's shell.
  useTheme();

  // Copies the signed-in user's name, bio and photo to their public profile
  // so other readers can see them.
  useProfileSync();

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
  }, [dispatch]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-bg">
        <Loader text="Preparing your workspace" />
      </div>
    );
  }

  if (AUTH_PAGES.includes(pathname)) {
    return (
      <AuthShell>
        <Outlet />
      </AuthShell>
    );
  }

  return (
    <div className="flex min-h-screen bg-ink-bg text-ink-text">
      <Sidebar open={menuOpen} onClose={closeMenu} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenMenu={() => setMenuOpen(true)} />
        {user && !user.emailVerification && pathname !== "/verify" && (
          <VerifyEmailNotice banner />
        )}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default App;
