import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { forgotPasswordApi } from "../../queries/comman";
import ReusableButton from "../../atoms/ReusableButton";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: forgotPasswordApi,
    onSuccess: () => {
      formik.resetForm();
      setLoading(false);
      navigate("/login");
    },
    onError: () => {
      setLoading(false);
    },
  });

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    }),
    onSubmit: (values) => {
      if (!values.email) {
        console.error("Email is required");
        return;
      }
      mutation.mutate(values);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold font-family-sans mb-4 text-center text-gray-800">
          Forgot Password
        </h1>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Enter your email to receive a password reset link.
        </p>
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-3">
            <label
              className="block text-gray-700 mb-1 text-sm font-semibold"
              htmlFor="email"
            >
              Email Address*
            </label>
            <input
              type="email"
              id="email"
              className={`w-full px-3 py-2 text-sm border ${
                formik.errors.email && formik.touched.email
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400`}
              placeholder="Enter your email"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.email}
              </div>
            ) : null}
          </div>
          <ReusableButton
            type="submit"
            loading={loading}
            onClick={formik.handleSubmit}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </ReusableButton>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Remember your password?{" "}
          <a href="/" className="text-blue-600 hover:underline font-medium">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
