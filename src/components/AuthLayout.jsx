import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "./Loading";

export default function Protected({ children, authentication = true }) {
  const navigate = useNavigate();
  const [loader, setloader] = useState(true);

  const authStatus = useSelector((state) => state.auth.status);

  useEffect(() => {
    if (authStatus !== authentication) {
      navigate(authentication ? "/login" : "/", {
        state: { message: "Login first to view posts" },
      });
    }

    setloader(false);
  }, [authStatus, navigate, authentication]);

  return loader ? <Loader/> : <>{children}</>;
}
