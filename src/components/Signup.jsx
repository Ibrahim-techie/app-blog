import { useState } from "react";
import authService from "../services/auth.service";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../redux/authSlice";
import { Button, Logo, Input } from "./index";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";

function Signup() {
  const navigate = useNavigate();
  const [Error, setError] = useState("");
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const create = async (data) => {
    setError("");
    try {
      const userData = await authService.createAccount(data);
      if (userData) {
        const getuserData = authService.getCurrentUser();

        if (getuserData) {
          dispatch(login(getuserData));
          navigate("/");
        }
      }
    } catch (error) {
      setError(error);
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
            placeHolder="Enter your Full Name"
            {...register("name", {
              required: "Name is Required",
            })}
          />
          <Input
            label="email"
            placeHolder="Enter Your Email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Enter a valid email",
              },
            })}
          />

          <Input
            label="password"
            placeHolder="Enter Your Password"
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />

          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
