import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = forwardRef(function Input(
  { label, type = "text", className = "", ...props },
  ref,
) {
  const id = useId();
  // Password fields get a show / hide button, so a typo can be checked
  // before submitting — especially on phones.
  const isPassword = type === "password";
  const [revealed, setRevealed] = useState(false);

  return (
    <div>
      {label && (
        <label
          className="mb-1.5 block font-mono text-xs uppercase tracking-[0.96px] text-ink-text-2"
          htmlFor={id}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type={isPassword && revealed ? "text" : type}
          className={`w-full rounded-lg border border-ink-border bg-ink-bg px-3 py-2.5 text-base text-ink-text sm:text-sm outline-none transition-colors placeholder:text-ink-muted focus:border-ink-border-strong file:mr-3 file:rounded-lg file:border-0 file:bg-ink-surface-2 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-ink-text ${
            isPassword ? "pr-11" : ""
          } ${className}`}
          ref={ref}
          {...props}
          id={id}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            aria-controls={id}
            title={revealed ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-lg text-ink-text-2 transition-colors hover:text-ink-text"
          >
            {revealed ? (
              <EyeOff size={18} strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Eye size={18} strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </div>
  );
});

export default Input;
