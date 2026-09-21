import { Toaster } from "sonner";
import { useSelector } from "react-redux";

/**
 * Toaster wired to the app's own theme.
 *
 * Sonner's default "system" theme follows the OS setting, but this app toggles
 * dark mode with a class, so the two can disagree — a light toast on a dark
 * page. Reading the theme from the store keeps them in step.
 */
function AppToaster() {
  const theme = useSelector((state) => state.system.theme);

  return (
    <Toaster
      theme={theme === "dark" ? "dark" : "light"}
      position="bottom-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast: "rounded-xl shadow-lg",
          title: "font-semibold",
        },
      }}
    />
  );
}

export default AppToaster;
