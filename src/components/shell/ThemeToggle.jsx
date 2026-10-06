import { Moon, Sun } from "lucide-react";
import useTheme from "../../customHooks/useTheme";

/** Light/dark switch. Shows the theme you'd switch *to*. */
function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      className={`inline-flex size-9 items-center justify-center rounded-lg text-ink-text transition-colors hover:bg-ink-surface-2 ${className}`}
    >
      <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}

export default ThemeToggle;
