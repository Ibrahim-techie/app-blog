import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import UserAvatar from "../UserAvatar";
import Logoutbtn from "../header/Logoutbtn";

const itemClass =
  "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs font-semibold text-ink-text transition-colors hover:bg-ink-surface-2";

/** The signed-in user's avatar, name and a small Profile / Log out menu. */
function UserMenu() {
  const user = useSelector((state) => state.auth.userData);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) =>
      ref.current?.contains(event.target) || setOpen(false);
    const onKeyDown = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-lg"
      >
        <UserAvatar
          name={user?.name}
          avatarId={user?.prefs?.avatarId}
          size={34}
          className="rounded-lg bg-ink-sage text-xs text-ink-avatar-text"
        />
        <span className="hidden max-w-40 truncate text-xs font-semibold text-ink-text sm:block">
          {user?.name || "Your account"}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          aria-hidden="true"
          className={`text-ink-text transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-lg border border-ink-border bg-ink-surface py-1"
        >
          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            <UserRound size={15} strokeWidth={1.75} aria-hidden="true" />
            Profile
          </Link>
          <Logoutbtn role="menuitem" className={itemClass}>
            <LogOut size={15} strokeWidth={1.75} aria-hidden="true" />
            Log out
          </Logoutbtn>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
