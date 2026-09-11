import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "./Loading";

export default function Protected({ children, authentication = true }) {
  const navigate = useNavigate();

  const authStatus = useSelector((state) => state.auth.status);

  useEffect(() => {
    if (authStatus !== authentication) {
      navigate(authentication ? "/login" : "/", {
        state: { message: "Login first to view posts" },
      });
    }

  }, [authStatus, navigate, authentication]);

  return authStatus !== authentication ? <Loader text="Checking your session" className="bg-slate-50 dark:bg-slate-950" /> : <>{children}</>;
}
