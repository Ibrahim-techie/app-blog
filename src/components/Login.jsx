import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login as storeLogin } from "../redux/authSlice";
import { Button, Input, Logo } from "./index";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import GoogleIcon from "../assets/GoogleIcon";
import authService from "../services/auth.service";
import { toast } from "sonner";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const message = location.state?.message;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [Error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const login = async (data) => {
    setError("");
    setIsLoading(true);

    try {
      const session = await authService.logIn(data);

      if (session) {
        const userData = await authService.getCurrentUser();

        if (userData) {
          dispatch(storeLogin(userData));

          toast.success(
            userData.name
              ? `Welcome back, ${userData.name}`
              : "Welcome back"
          );
        }

        navigate("/");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    authService.signInwithGoogle();
  };

  return (
    <div className="flex items-center justify-center w-full">
      <div className="mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10">

        {/* Logo */}
        <div className="mb-2 flex justify-center">
          <span className="inline-block w-full max-w-25">
            <Logo width="100%" />
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-center text-2xl font-bold leading-tight">
          Sign in to your account
        </h2>

        <p className="mt-2 text-center text-base text-black/60">
          Don&apos;t have an account?&nbsp;
          <Link
            to="/signup"
            className="font-medium text-primary transition-all duration-200 hover:underline"
          >
            Sign Up
          </Link>
        </p>

        {/* Redirect message */}
        {message && (
          <p className="text-blue-600 mt-4 text-center font-medium">
            {message}
          </p>
        )}

        {/* Error */}
        {Error && (
          <p className="text-red-600 mt-8 text-center">
            {Error}
          </p>
        )}

        <form onSubmit={handleSubmit(login)} className="mt-8">

          <div className="space-y-5">

            {/* Email */}
            <Input
              label="Email"
              placeholder="Enter your email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value:
                    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Enter a valid email",
                },
              })}
            />

            {errors.email && (
              <p className="text-red-500 text-sm">
                {errors.email.message}
              </p>
            )}

            {/* Password */}
            <Input
              label="Password"
              placeholder="Enter your password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />

            {errors.password && (
              <p className="text-red-500 text-sm">
                {errors.password.message}
              </p>
            )}

            {/* Email Login */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            {/* Google Login */}
            <button
              type="button"
              className="flex items-center justify-center w-full h-12 gap-3 rounded-lg border border-gray-300 bg-white shadow hover:shadow-md transition duration-200"
              onClick={handleGoogleLogin}
            >
              <GoogleIcon className="w-8 h-8" />

              <span className="text-sm font-medium text-gray-700">
                Continue with Google
              </span>
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;