import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { login } from "../../Redux/authSlice";
import { loginApi } from "../../queries/comman";
import ReusableButton from "../../atoms/ReusableButton";
const BackendUrl = import.meta.env.VITE_BACKEND_URL;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      formik.resetForm();
      dispatch(login(data?.result));
      setLoading(false);
      navigate("/dfk-agent");
    },
    onError: () => {
      setLoading(false);
    },
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .required("Password is required")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
        ),
    }),
    onSubmit: (values) => {
      if (!values.email || !values.password) {
        console.error("All fields are required");
        return;
      }
      mutation.mutate(values);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Sign In
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Access your account and start exploring
        </p>
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-5">
            <label
              className="block text-sm font-semibold text-gray-700 mb-2"
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                formik.errors.email && formik.touched.email
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter your email"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email ? (
              <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
            ) : null}
          </div>
          <div className="mb-6">
            <label
              className="block text-sm font-semibold text-gray-700 mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                  formik.errors.password && formik.touched.password
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter your password"
                {...formik.getFieldProps("password")}
              />
              <div
                className="absolute inset-y-0 right-4 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} className="text-gray-600" />
                ) : (
                  <AiOutlineEye size={20} className="text-gray-600" />
                )}
              </div>
            </div>
            {formik.touched.password && formik.errors.password ? (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.password}
              </p>
            ) : null}
          </div>
          <ReusableButton
            type="submit"
            loading={loading}
            onClick={formik.handleSubmit}
          >
            {loading ? "Signing In..." : "Sign In"}
          </ReusableButton>
        </form>
        <div className="my-6 text-center">
          <p className="text-gray-600">Or sign in with</p>
        </div>
        <button
          onClick={() => {
            window.open(`${BackendUrl}/v1/auth/google`, "_self");
          }}
          className="w-full flex items-center justify-center py-3 border text-sm font-semibold rounded-lg shadow-lg bg-white text-gray-700 hover:bg-gray-100 transition-all duration-300"
        >
          <FcGoogle className="mr-2" size={20} /> Continue with Google
        </button>
        <p className="text-sm text-gray-500 mt-6 text-center">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Create one
          </a>
        </p>
        <p className="text-sm text-gray-500 mt-2 text-center">
          <a
            href="/forgot-password"
            className="text-blue-600 hover:underline font-medium"
          >
            Forgot Password?
          </a>
        </p>
      </div>
    </div>
  );
}
