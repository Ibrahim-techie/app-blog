import { MailCheck } from "lucide-react";
import useEmailVerification from "../customHooks/useEmailVerification";

/**
 * "Verify your email" with a resend button. `banner` is the thin strip under
 * the top bar; the default is a panel shown in place of a blocked action.
 */
function VerifyEmailNotice({ action = "post, comment and like", banner = false }) {
  const { email, resend, isResending } = useEmailVerification();

  const button = (
    <button
      type="button"
      onClick={resend}
      disabled={isResending}
      className="inline-flex h-9 shrink-0 items-center rounded-lg bg-ink-primary px-4 text-xs font-semibold text-ink-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {isResending ? "Sending…" : "Resend link"}
    </button>
  );

  if (banner) {
    return (
      <div
        role="status"
        className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-border bg-ink-surface-2 px-4 py-3 sm:px-10"
      >
        <p className="flex items-center gap-2 text-sm text-ink-text">
          <MailCheck size={18} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />
          <span>
            Verify your email to {action}. We sent a link to{" "}
            <span className="font-semibold">{email}</span>.
          </span>
        </p>
        {button}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-4 rounded-lg border border-ink-border bg-ink-surface p-6">
      <MailCheck size={28} strokeWidth={1.25} aria-hidden="true" className="text-ink-text" />
      <div className="flex flex-col gap-1.5">
        <p className="text-lg font-semibold text-ink-text">Verify your email first</p>
        <p className="text-sm leading-[1.6] text-ink-text-2">
          To {action}, click the link we sent to{" "}
          <span className="font-semibold text-ink-text">{email}</span>. Can&apos;t
          find it? Check spam, or send a new one.
        </p>
      </div>
      {button}
    </div>
  );
}

export default VerifyEmailNotice;
