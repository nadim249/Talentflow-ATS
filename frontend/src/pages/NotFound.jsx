// src/pages/NotFound.jsx

import { Link } from 'react-router';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();
  const returnPath = user ? '/dashboard' : '/jobs-board';
  const returnLabel = user ? 'Back to Dashboard' : 'Back to Careers Board';

  return (
    <div className="grid min-h-[70vh] place-items-center p-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <HelpCircle size={32} />
        </div>
        <span className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          404 Error
        </span>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            to={returnPath}
            className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/30 active:scale-95"
          >
            <ArrowLeft size={16} /> {returnLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
