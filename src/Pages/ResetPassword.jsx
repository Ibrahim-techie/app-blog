import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button, Input } from "../components";
import authService from "../services/auth.service";

/**
 * Step 2 of password recovery. The emailed link lands here with
 * ?userId=…&secret=…; the user picks a new password.
 */
function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const userId = params.get("userId");
  const secret = params.get("secret");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm();
  const password = useWatch({ control, name: "password" });

  const reset = async ({ password }) => {
    setError("");
    try {
      await authService.resetPassword({ userId, secret, password });
      toast.success("Password changed", {
        description: "Sign in with your new password.",
      });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(
        err?.code === 401
          ? "This link has expired or was already used. Request a new one."
          : err?.message || "Couldn't change your password. Please try again.",
      );
    }
  };

  const linkBroken = !userId || !secret;

  return (
    <div className="w-full max-w-[440px]">
      <div className="rounded-lg border border-ink-border bg-ink-surface p-8 sm:p-10">
        <p className="font-mono text-xs leading-[1.5] tracking-[0.96px] text-ink-text-2">
          ACCOUNT RECOVERY
        </p>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.02] tracking-[-1.6px] text-ink-text">
          CHOOSE A NEW PASSWORD.
        </h1>

        {linkBroken ? (
          <>
            <p className="mt-4 text-sm leading-[1.6] text-ink-text-2">
              This reset link is incomplete. Open the full link from your
              email, or request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-primary text-xs font-semibold text-ink-on-primary"
            >
              Request a new link
            </Link>
          </>
        ) : (
          <>
            {error && (
              <p role="alert" className="mt-5 text-sm text-ink-error">
                {error}{" "}
                {error.includes("Request a new one") && (
                  <Link to="/forgot-password" className="font-semibold underline underline-offset-4">
                    Get a new link
                  </Link>
                )}
              </p>
            )}

            <form onSubmit={handleSubmit(reset)} className="mt-8 space-y-5" noValidate>
              <div>
                <Input
                  label="New password"
                  placeholder="At least 8 characters"
                  type="password"
                  autoComplete="new-password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                />
                {errors.password && (
                  <p className="mt-1.5 text-xs text-ink-error">{errors.password.message}</p>
                )}
              </div>

              <div>
                <Input
                  label="Confirm password"
                  placeholder="Type it again"
                  type="password"
                  autoComplete="new-password"
                  {...register("confirm", {
                    required: "Please confirm your password",
                    validate: (value) => value === password || "Passwords don't match",
                  })}
                />
                {errors.confirm && (
                  <p className="mt-1.5 text-xs text-ink-error">{errors.confirm.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Change password"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
