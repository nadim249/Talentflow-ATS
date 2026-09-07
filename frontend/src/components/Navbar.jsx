// src/components/Navbar.jsx
import { LogOut, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const initials = (user?.name || 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-ink-700 dark:bg-ink-800">
      <div className="flex flex-1 items-center gap-4">{children}</div>
      <button
        onClick={toggleTheme}
        className="rounded-md p-2 text-slate-500 hover-tint hover:bg-slate-100 hover:text-brand-500 active:scale-95 dark:text-slate-300 dark:hover:bg-ink-700 dark:hover:text-brand-400"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <div className="relative ml-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-sm font-semibold text-white transition-all duration-150 ease-out hover:ring-2 hover:ring-brand-500/40 hover:ring-offset-2 hover:ring-offset-white active:scale-95 dark:hover:ring-offset-ink-800"
        >
          {initials}
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-56 origin-top-right animate-[fadeIn_120ms_ease-out] rounded-md border border-slate-200 bg-white py-1 shadow-card dark:border-ink-700 dark:bg-ink-800">
            <div className="border-b border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-ink-700 dark:text-slate-400">
              <div className="leading-tight">Signed in as</div>
              <div className="mt-1 truncate font-medium text-slate-700 dark:text-slate-200">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover-tint hover:bg-slate-50 hover:text-rose-600 dark:text-slate-200 dark:hover:bg-ink-700 dark:hover:text-rose-400"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
