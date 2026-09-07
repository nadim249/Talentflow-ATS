// src/components/Modal.jsx
import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, title, onClose, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fadeIn dark:bg-black/60"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex w-full ${maxWidth} max-h-[90vh] flex-col overflow-hidden rounded-xl bg-white shadow-card animate-[scaleIn_180ms_ease-out] dark:bg-ink-800 dark:text-slate-100`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-ink-700">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover-tint hover:bg-slate-100 hover:text-rose-500 active:scale-90 dark:text-slate-300 dark:hover:bg-ink-700 dark:hover:text-rose-400"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
