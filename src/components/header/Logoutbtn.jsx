import authService from "../../services/auth.service";
import { logout } from "../../redux/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
function Logoutbtn({
  className = "inline-flex h-9 items-center rounded-lg border border-ink-border px-4 text-xs font-semibold text-ink-text",
  children = "Logout",
  ...props
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function logoutHandler() {
    try {
      await authService.logOut();
      dispatch(logout());
      toast.success("Signed out", { description: "See you next time" });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Couldn't sign you out", {
        description: error?.message || "Please try again.",
      });
    }
  }
  return (
    <button type="button" className={className} onClick={logoutHandler} {...props}>
      {children}
    </button>
  );
}

export default Logoutbtn;
