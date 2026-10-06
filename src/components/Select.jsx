import { forwardRef, useId } from "react";

/**
 * INK select. `options` may be plain strings (value and label alike) or
 * `{ value, label }` objects. `placeholder` adds an empty first option.
 */
function Select({ options, label, placeholder, className = "", ...props }, ref) {
  const id = useId();

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block font-mono text-xs uppercase tracking-[0.96px] text-ink-text-2"
        >
          {label}
        </label>
      )}
      <select
        {...props}
        id={id}
        ref={ref}
        className={`h-11 w-full rounded-lg border border-ink-border bg-ink-bg px-3 text-sm capitalize text-ink-text outline-none transition-colors focus:border-ink-border-strong aria-[invalid=true]:border-ink-error ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options?.map((option) => {
          const { value, label: text } =
            typeof option === "string" ? { value: option, label: option } : option;
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default forwardRef(Select);
