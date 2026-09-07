// src/components/PasswordInput.jsx
// Password field with an inline show/hide toggle. Forwards react-hook-form's
// register() ref so it works as a drop-in replacement for <input type="password">.
// Uses a flex-row layout so the input and eye button share identical heights —
// the icon is vertically centered by the flex alignment, with no absolute
// positioning involved.
import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = forwardRef(function PasswordInput(
  { className = '', ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className={`flex items-stretch rounded-md border border-slate-300 bg-white transition-colors duration-150 ease-out focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 dark:border-ink-600 dark:bg-ink-800 ${className}`}
    >
      <input
        ref={ref}
        type={visible ? 'text' : 'password'}
        {...rest}
        className="flex-1 rounded-l-md bg-transparent px-3 py-2 text-sm leading-5 text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
        className="flex w-11 shrink-0 items-center justify-center rounded-r-md border-l border-slate-300 bg-slate-50 text-slate-500 transition-colors duration-150 ease-out hover:text-brand-600 dark:border-l-ink-600 dark:bg-ink-700/40 dark:text-slate-400 dark:hover:text-brand-400"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
});

export default PasswordInput;
