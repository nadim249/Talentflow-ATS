// src/components/LoadingSpinner.jsx

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent dark:border-brand-400" />
      {text && (
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {text}
        </p>
      )}
    </div>
  );
}
