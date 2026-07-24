import authService from "../../services/auth.service";
import { logout } from "../../redux/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
function Logoutbtn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function logoutHandler() {
    try {
      await authService.logOut();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }
  return (
    <button
      className="inline-block px-6 py-2 duration-200 rounded-full hover:bg-blue-100 bg-red-500 text-white"
      onClick={logoutHandler}
    >
      Logout
    </button>
  );
}

export default Logoutbtn;
