import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { login as storeLogin } from "../redux/authSlice";
import { Button, Input } from "./index";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import GoogleIcon from "../assets/GoogleIcon";
import authService from "../services/auth.service";
import { toast } from "sonner";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [params] = useSearchParams();
  // Appwrite sends a cancelled or failed Google sign-in back to
  // /login?oauth=failed (adding its own ?error=…).
  const message =
    location.state?.message ??
    (params.get("oauth") === "failed" || params.has("error")
      ? "Google sign-in was cancelled or didn't complete. Please try again."
      : null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [Error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const login = async (data) => {
    setError("");
    setIsLoading(true);

    try {
      const session = await authService.logIn(data);

      if (session) {
        const userData = await authService.getCurrentUser();

        if (userData) {
          dispatch(storeLogin(userData));

          toast.success(
            userData.name
              ? `Welcome back, ${userData.name}`
              : "Welcome back"
          );
        }

        navigate("/",{replace:true});
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    authService.signInwithGoogle();
  };

  return (
    <div className="w-full max-w-[440px]">
      <div className="rounded-lg border border-ink-border bg-ink-surface p-8 sm:p-10">
        <p className="font-mono text-xs leading-[1.5] tracking-[0.96px] text-ink-text-2">
          WELCOME BACK
        </p>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.02] tracking-[-1.6px] text-ink-text">
          SIGN IN TO INK.
        </h1>

        <p className="mt-3 text-sm text-ink-text-2">
          Don&apos;t have an account?&nbsp;
          <Link
            to="/signup"
            className="font-semibold text-ink-brand underline underline-offset-4"
          >
            Sign Up
          </Link>
        </p>

        {/* Redirect message */}
        {message && (
          <p className="mt-5 rounded-lg border border-ink-border bg-ink-surface-2 px-3 py-2 text-sm text-ink-text">
            {message}
          </p>
        )}

        {/* Error */}
        {Error && (
          <p role="alert" className="mt-5 text-sm text-ink-error">
            {Error}
          </p>
        )}

        <form onSubmit={handleSubmit(login)} className="mt-8">
          <div className="space-y-5">
            {/* Email */}
            <div>
              <Input
                label="Email"
                placeholder="Enter your email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value:
                      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Enter a valid email",
                  },
                })}
              />

              {errors.email && (
                <p className="mt-1.5 text-xs text-ink-error">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <Input
                label="Password"
                placeholder="Enter your password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />

              {errors.password && (
                <p className="mt-1.5 text-xs text-ink-error">
                  {errors.password.message}
                </p>
              )}
              <Link
                to="/forgot-password"
                className="mt-2 inline-block text-xs font-semibold text-ink-text-2 underline-offset-4 hover:text-ink-text hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Email Login */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            {/* Google Login */}
            <button
              type="button"
              className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-ink-border bg-ink-bg text-xs font-semibold text-ink-text transition-colors hover:border-ink-border-strong"
              onClick={handleGoogleLogin}
            >
              <GoogleIcon className="h-6 w-6" />
              Continue with Google
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
