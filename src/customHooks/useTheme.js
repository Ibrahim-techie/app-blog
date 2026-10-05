import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { themeSwitch } from "../redux/systemSlice";

/**
 * The app's light/dark theme: read it, and switch it.
 *
 * Redux holds the current theme (AppToaster reads it too); this hook keeps the
 * `dark`/`light` class on <html> and the saved choice in localStorage in step
 * with it — the same three places the old Header kept in sync.
 */
function useTheme() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.system.theme);

  // Idempotent, so it's harmless for several components to use the hook.
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Storage unavailable — the theme still applies for this visit.
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => dispatch(themeSwitch(theme === "light" ? "dark" : "light")),
    [dispatch, theme],
  );

  return { theme, isDark: theme === "dark", toggleTheme };
}

export default useTheme;
