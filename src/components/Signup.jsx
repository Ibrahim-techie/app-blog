import { useState } from "react";
import authService from "../services/auth.service";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../redux/authSlice";
import { Button, Logo, Input } from "./index";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import GoogleIcon from "../assets/GoogleIcon";

function Signup() {
  const navigate = useNavigate();
  const [Error, setError] = useState("");
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const create = async (data) => {
    setError("");
    try {
      const userData = await authService.createAccount(data);
      if (userData) {
        const getuserData = await authService.getCurrentUser();

        if (getuserData) {
          dispatch(login(getuserData));
          toast.success("Account created", {
            description: "Write your first post whenever you're ready.",
          });
          navigate("/");
        }
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10`}
      >
        <div className="mb-2 flex justify-center">
          <span className="inline-block w-full max-w-25">
            <Logo width="100%" />
          </span>
        </div>
        <h2 className="text-center text-2xl font-bold leading-tight">
          Sign up to create account
        </h2>
        <p className="mt-2 text-center text-base text-black/60">
          Already have an account?&nbsp;
          <Link
            to="/login"
            className="font-medium text-primary transition-all duration-200 hover:underline"
          >
            Sign In
          </Link>
        </p>
        {Error && <p className="text-red-600 mt-8 text-center">{Error}</p>}

        <form onSubmit={handleSubmit(create)}>
          <div className="space-y-5"></div>
          <Input
            label="Full-Name"
            placeholder="Enter your Full Name"
            {...register("name", {
              required: "Name is Required",
            })}
          />
          {errors.name && (
            <p className="text-red-600 text-sm">{errors.name.message}</p>
          )}
          <Input
            label="email"
            placeholder="Enter Your Email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Enter a valid email",
              },
            })}
          />
          {errors.email && (
            <p className="text-red-600 text-sm">{errors.email.message}</p>
          )}
          <Input
            label="password"
            placeholder="Enter Your Password"
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
            <p className="text-red-600 text-sm">{errors.password.message}</p>
          )}
          <Button
            type="submit"
            className="p-2 w-full m-2 rounded-xl hover:bg-blue-600 hover:scale-95 transition ease-in-out font-medium"
          >
            Create Account
          </Button>

          <h1 className="m-2 text-center text-xl text-black">
            Sign up with Google
          </h1>

          <button
            type="button"
            className="flex items-center justify-center w-full h-12 gap-3 rounded-lg border border-gray-300 bg-white shadow hover:shadow-md transition duration-200"
            onClick={() => {
              console.log("Google button clicked");
              authService.signInwithGoogle();
            }}
          >
            <GoogleIcon className="w-8 h-8" />
            <span className="text-sm font-medium text-gray-700">
              Continue with Google
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
