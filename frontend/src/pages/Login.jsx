// src/pages/Login.jsx
// Recruiter sign-in page.

import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router';
import toast from 'react-hot-toast';
import { Moon, Sun } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import { getApiErrorMessage } from '../services/api';
import PasswordInput from '../components/PasswordInput';

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();


  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success('Welcome back!');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Login failed'));
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-4 dark:bg-ink-900">
      {/* Dark / Light mode toggle */}
      <button
        onClick={toggleTheme}
        className="fixed right-4 top-4 rounded-md p-2 text-slate-500 transition-all duration-150 ease-out hover:bg-slate-100 hover:text-brand-600 active:scale-90 dark:text-slate-300 dark:hover:bg-ink-700 dark:hover:text-brand-400"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-ink-700 dark:bg-ink-800"
      >
        <h1 className="mb-1 text-xl font-semibold dark:text-white">Sign in to TalentFlow</h1>
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          Use your recruiter credentials.
        </p>

        {/* Email Field */}
        <label className="mb-1 block text-sm font-medium dark:text-slate-200">Email</label>
        <input
          type="email"
          placeholder="recruiter@company.com"
          {...register('email', { required: 'Email is required' })}
          className="input mb-3"
        />
        {errors.email && <p className="mb-2 text-xs text-rose-600">{errors.email.message}</p>}

        {/* Password Field */}
        <label className="mb-1 block text-sm font-medium dark:text-slate-200">Password</label>
        <PasswordInput
          placeholder="••••••••"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Minimum 6 characters' },
          })}
          className="mb-4"
        />
        {errors.password && <p className="mb-2 text-xs text-rose-600">{errors.password.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-brand-500 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/30 active:scale-95 disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
          New here?{' '}
          <Link
            to="/register"
            className="text-brand-600 transition-colors duration-150 ease-out hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
          >
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
