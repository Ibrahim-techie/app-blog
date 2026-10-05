import { Link } from "react-router-dom";
import InkLogo from "../InkLogo";
import ThemeToggle from "./ThemeToggle";

/** Sign-in and sign-up live outside the app shell: just the logo and theme. */
function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink-bg">
      <header className="flex h-24 items-center justify-between border-b border-ink-border px-5 sm:px-10">
        <Link to="/" aria-label="INK home">
          <InkLogo />
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-start justify-center px-5 py-12 sm:py-16">
        {children}
      </main>
    </div>
  );
}

export default AuthShell;
