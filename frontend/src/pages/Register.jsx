// src/pages/Register.jsx
// Recruiter sign-up page.

import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../services/api";
import PasswordInput from "../components/PasswordInput";

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const { register: signup } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await signup(data);
      toast.success("Account created successfully!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Registration failed"));
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-4 dark:bg-ink-900">


      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-ink-700 dark:bg-ink-800"
      >
        <h1 className="mb-1 text-xl font-semibold dark:text-white">
          Create your account
        </h1>
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          Sign up as a recruiter to start tracking candidates.
        </p>

        {/* Full Name */}
        <label className="mb-1 block text-sm font-medium dark:text-slate-200">
          Full name
        </label>
        <input
          placeholder="Jane Doe"
          {...register("name", { required: "Name is required" })}
          className="input mb-3"
        />
        {errors.name && (
          <p className="mb-2 text-xs text-rose-600">{errors.name.message}</p>
        )}

        {/* Email */}
        <label className="mb-1 block text-sm font-medium dark:text-slate-200">
          Email
        </label>
        <input
          type="email"
          placeholder="jane@company.com"
          {...register("email", { required: "Email is required" })}
          className="input mb-3"
        />
        {errors.email && (
          <p className="mb-2 text-xs text-rose-600">{errors.email.message}</p>
        )}

        {/* Password */}
        <label className="mb-1 block text-sm font-medium dark:text-slate-200">
          Password
        </label>
        <PasswordInput
          placeholder="••••••••"
          {...register("password", {
            required: "Password is required",
            minLength: { value: 6, message: "Minimum 6 characters" },
          })}
          className="mb-4"
        />
        {errors.password && (
          <p className="mb-2 text-xs text-rose-600">
            {errors.password.message}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-brand-500 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/30 active:scale-95 disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create account"}
        </button>

        {/* Link to Sign In - using React Router Link */}
        <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-brand-600 transition-colors duration-150 ease-out hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
