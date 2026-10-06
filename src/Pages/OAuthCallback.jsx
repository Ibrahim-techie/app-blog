import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import authService from "../services/auth.service";
import { login } from "../redux/authSlice";
import { Loader } from "../components";

const FAILED = {
  replace: true,
  state: { message: "Google sign-in didn't complete. Please try again." },
};

/**
 * Google sends the user back here with a one-time ?userId=…&secret=…, which
 * is exchanged for a session from the app itself. Doing the exchange here —
 * rather than letting Appwrite set the session cookie during the redirect —
 * means the session doesn't depend on third-party cookies, which mobile
 * Chrome, Safari and private windows block.
 */
function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const started = useRef(false);

  useEffect(() => {
    // The secret works once; don't let StrictMode's second run spend it.
    if (started.current) return;
    started.current = true;

    const userId = params.get("userId");
    const secret = params.get("secret");
    if (!userId || !secret) {
      navigate("/login", FAILED);
      return;
    }

    authService
      .finishOAuth({ userId, secret })
      .then(() => authService.getCurrentUser())
      .then((user) => {
        if (!user) throw new Error("No session");
        dispatch(login(user));
        toast.success(user.name ? `Welcome, ${user.name}` : "Welcome to INK");
        navigate("/", { replace: true });
      })
      .catch((error) => {
        console.log("OAuth callback failed :: OAuthCallback.jsx", error);
        navigate("/login", FAILED);
      });
  }, [params, navigate, dispatch]);

  return <Loader text="Signing you in" />;
}

export default OAuthCallback;
