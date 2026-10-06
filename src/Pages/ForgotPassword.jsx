import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button, Input } from "../components";
import authService from "../services/auth.service";

/** Step 1 of password recovery: ask for the email and send the reset link. */
function ForgotPassword() {
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const send = async ({ email }) => {
    setError("");
    try {
      await authService.sendRecovery(email.trim());
      setSentTo(email.trim());
    } catch (err) {
      // Appwrite answers 404 for an unknown address. Showing the same
      // "check your inbox" screen either way stops this form from being used
      // to find out who has an account.
      if (err?.code === 404) setSentTo(email.trim());
      else if (err?.code === 429)
        setError("Too many attempts. Please wait a few minutes and try again.");
      else setError(err?.message || "Couldn't send the email. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-[440px]">
      <div className="rounded-lg border border-ink-border bg-ink-surface p-8 sm:p-10">
        <p className="font-mono text-xs leading-[1.5] tracking-[0.96px] text-ink-text-2">
          ACCOUNT RECOVERY
        </p>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.02] tracking-[-1.6px] text-ink-text">
          {sentTo ? "CHECK YOUR INBOX." : "FORGOT PASSWORD?"}
        </h1>

        {sentTo ? (
          <>
            <p className="mt-4 text-sm leading-[1.6] text-ink-text-2">
              If an account exists for{" "}
              <span className="font-semibold text-ink-text">{sentTo}</span>, we
              sent a link to reset its password. The link expires in an hour.
              Check spam if it doesn&apos;t arrive.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Link
                to="/login"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-primary text-xs font-semibold text-ink-on-primary"
              >
                Back to sign in
              </Link>
              <button
                type="button"
                onClick={() => setSentTo("")}
                className="text-xs font-semibold text-ink-text-2 underline underline-offset-4 hover:text-ink-text"
              >
                Use a different email
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-ink-text-2">
              Enter your account email and we&apos;ll send you a link to choose
              a new password.
            </p>

            {error && (
              <p role="alert" className="mt-5 text-sm text-ink-error">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit(send)} className="mt-8 space-y-5" noValidate>
              <div>
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  type="email"
                  autoComplete="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Enter a valid email",
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-ink-error">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send reset link"}
              </Button>

              <p className="text-center text-sm text-ink-text-2">
                Remembered it?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-ink-text underline underline-offset-4"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
