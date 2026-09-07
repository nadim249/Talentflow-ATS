// src/public/PublicLayout.jsx
import { Link, Outlet } from 'react-router';
import { ListChecks, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function PublicLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-ink-900">
      <header className="border-b border-slate-200 bg-white dark:border-ink-700 dark:bg-ink-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link to="/jobs-board" className="group flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-brand-500 text-white transition-transform duration-200 ease-out group-hover:rotate-6 group-hover:scale-105">
              <ListChecks size={18} />
            </div>
            <span className="font-semibold dark:text-white">TalentFlow Careers</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-md p-2 text-slate-500 transition-all duration-150 ease-out hover:bg-slate-100 hover:text-brand-600 active:scale-90 dark:text-slate-300 dark:hover:bg-ink-700 dark:hover:text-brand-400"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link
              to="/login"
              className="text-sm text-brand-600 transition-colors duration-150 ease-out hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
            >
              Recruiter login
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
