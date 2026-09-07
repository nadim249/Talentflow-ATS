// src/components/ErrorBoundary.jsx
// Catches unexpected React rendering errors and displays a friendly recovery UI
// instead of a blank white screen.

import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TalentFlow Uncaught Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-ink-900">
          <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-card dark:border-ink-700 dark:bg-ink-800">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
              <AlertTriangle size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              An unexpected error occurred while rendering this page.
            </p>
            {this.state.error?.message && (
              <pre className="mt-4 max-h-28 overflow-auto rounded bg-slate-100 p-2 text-left text-xs text-slate-700 dark:bg-ink-900 dark:text-slate-300">
                {this.state.error.message}
              </pre>
            )}
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-slate-50 dark:border-ink-600 dark:text-slate-200 dark:hover:bg-ink-700"
              >
                <RefreshCw size={14} /> Refresh page
              </button>
              <button
                onClick={this.handleReset}
                className="inline-flex items-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-brand-600 active:scale-95"
              >
                Back to home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
