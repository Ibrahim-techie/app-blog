import { useLocation } from "react-router-dom";
import { Login as Logincomponent } from "../components/index";

function Login() {
  const location = useLocation();
  const message = location.state?.message;

  return (
    <div className="py-8">
      {/* Show message only if it exists */}
      {message && (
        <div className="w-full py-8 mt-4 text-center">
          <h1 className="text-center text-2xl font-bold leading-tight">
            {message}
          </h1>
        </div>
      )}

      <Logincomponent />
    </div>
  );
}

export default Login;
