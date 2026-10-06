import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import authService from "../services/auth.service";
import { login } from "../redux/authSlice";
import { Loader } from "../components";

/** Landing page for the email-verification link: /verify?userId=…&secret=… */
function Verify() {
  const [params] = useSearchParams();
  const dispatch = useDispatch();
  const userId = params.get("userId");
  const secret = params.get("secret");
  const incomplete = !userId || !secret;

  const [state, setState] = useState(incomplete ? "failed" : "working"); // working | done | failed
  const [message, setMessage] = useState(
    incomplete ? "This link is incomplete. Open the full link from your email." : "",
  );
  const started = useRef(false);

  useEffect(() => {
    // A secret works once; don't let StrictMode's second run spend it twice.
    if (started.current || incomplete) return;
    started.current = true;

    authService
      .confirmVerification({ userId, secret })
      .then(async () => {
        const user = await authService.getCurrentUser();
        if (user) dispatch(login(user));
        setState("done");
        toast.success("Email verified", {
          description: "You can now post, comment and like.",
        });
      })
      .catch((error) => {
        setState("failed");
        setMessage(
          error?.code === 401
            ? "Sign in on this browser, then open the link again."
            : error?.message ||
                "This link has expired. Send a new one from the banner.",
        );
      });
  }, [userId, secret, incomplete, dispatch]);

  if (state === "working") return <Loader text="Verifying your email" />;

  const done = state === "done";

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col items-start gap-4 px-5 py-20 sm:px-10">
      <p className="font-mono text-xs tracking-[0.96px] text-ink-text-2">
        EMAIL VERIFICATION
      </p>
      <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-1.2px] text-ink-text">
        {done ? "You’re verified." : "Couldn’t verify."}
      </h1>
      <p className="font-serif text-[17px] leading-[1.6] text-ink-text-2">
        {done
          ? "Thanks for confirming your email. Your account is fully active."
          : message}
      </p>
      <Link
        to={done ? "/add-post" : "/"}
        className="mt-2 inline-flex h-11 items-center rounded-lg bg-ink-primary px-5 text-sm font-semibold text-ink-on-primary"
      >
        {done ? "Write your first post" : "Back to Home"}
      </Link>
    </div>
  );
}

export default Verify;
