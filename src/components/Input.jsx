import { forwardRef, useId } from "react";

const Input = forwardRef(function Input(
  { label, type = "text", className = "", ...props },
  ref,
) {
  const id = useId();
  return (
    <div>
      {label && (
        <label
          className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.3px] text-ink-muted"
          htmlFor={id}
        >
          {label}
        </label>
      )}

      <input
        type={type}
        className={`w-full rounded-[3px] border border-ink-border bg-ink-bg px-3 py-2.5 text-sm text-ink-text outline-none transition-colors placeholder:text-ink-muted focus:border-ink-border-strong file:mr-3 file:rounded-[2px] file:border-0 file:bg-ink-surface-2 file:px-3 file:py-1 file:text-xs file:font-extrabold file:text-ink-text ${className}`}
        ref={ref}
        {...props}
        id={id}
      />
    </div>
  );
});

export default Input;
