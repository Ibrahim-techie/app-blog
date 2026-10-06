import { useState } from "react";
import authService from "../services/auth.service";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../redux/authSlice";
import { Button, Input } from "./index";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import GoogleIcon from "../assets/GoogleIcon";
import { ALLOWED_EMAIL_HINT, isAllowedEmail } from "../utils/allowedEmail";

function Signup() {
  const navigate = useNavigate();
  const [Error, setError] = useState("");
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const create = async (data) => {
    setError("");
    try {
      const userData = await authService.createAccount(data);
      if (userData) {
        const getuserData = await authService.getCurrentUser();

        if (getuserData) {
          dispatch(login(getuserData));
          toast.success("Account created", {
            description: `We sent a verification link to ${getuserData.email}.`,
          });
          navigate("/");
        }
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="w-full max-w-[440px]">
      <div className="rounded-lg border border-ink-border bg-ink-surface p-8 sm:p-10">
        <p className="font-mono text-xs leading-[1.5] tracking-[0.96px] text-ink-text-2">
          JOIN THE COMMUNITY
        </p>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.02] tracking-[-1.6px] text-ink-text">
          CREATE YOUR ACCOUNT.
        </h1>
        <p className="mt-3 text-sm text-ink-text-2">
          Already have an account?&nbsp;
          <Link
            to="/login"
            className="font-semibold text-ink-brand underline underline-offset-4"
          >
            Sign In
          </Link>
        </p>
        {Error && (
          <p role="alert" className="mt-5 text-sm text-ink-error">
            {Error}
          </p>
        )}

        <form onSubmit={handleSubmit(create)} className="mt-8 space-y-5">
          <div>
            <Input
              label="Full Name"
              placeholder="Enter your Full Name"
              {...register("name", {
                required: "Name is Required",
              })}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-ink-error">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Input
              label="Email"
              placeholder="Enter Your Email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Enter a valid email",
                },
                validate: (value) =>
                  isAllowedEmail(value) ||
                  `This email provider isn't supported. ${ALLOWED_EMAIL_HINT}`,
              })}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-ink-error">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Input
              label="Password"
              placeholder="Enter Your Password"
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
          </div>
          <Button type="submit" className="w-full">
            Create Account
          </Button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-ink-border" />
            <span className="font-mono text-xs tracking-[0.96px] text-ink-text-2">
              OR
            </span>
            <span className="h-px flex-1 bg-ink-border" />
          </div>

          <button
            type="button"
            className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-ink-border bg-ink-bg text-xs font-semibold text-ink-text transition-colors hover:border-ink-border-strong"
            onClick={() => {
              // console.log("Google button clicked");
              authService.signInwithGoogle();
            }}
          >
            <GoogleIcon className="h-6 w-6" />
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
