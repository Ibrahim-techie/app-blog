// The INK primary button. bgColor / textColor still override the defaults
// for callers that need a different pairing.
function Button({
  children,
  type = "button",
  bgColor = "bg-ink-primary border border-ink-border-strong",
  textColor = "text-ink-on-primary",
  className = "",
  ...props
}) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-xs font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-60 ${bgColor} ${textColor} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
