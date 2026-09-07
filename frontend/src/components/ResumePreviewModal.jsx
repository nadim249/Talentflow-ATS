// src/components/ResumePreviewModal.jsx
import { useEffect, useState } from 'react';
import { Download, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';
import Modal from './Modal';

export default function ResumePreviewModal({ open, onClose, url, candidateName }) {
  const [mode, setMode] = useState('direct'); // 'direct' | 'proxy'
  const [errored, setErrored] = useState(false);

  // Reset whenever the modal is reopened for a new URL.
  useEffect(() => {
    if (open) {
      setMode('direct');
      setErrored(false);
    }
  }, [open, url]);

  if (!url) return null;

  const isCloudinary = /res\.cloudinary\.com\//i.test(url);
  const iframeSrc =
    mode === 'proxy'
      ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`
      : url;

  // Chrome doesn't fire onError for failed PDF embeds — we approximate
  // by listening to load and checking document.title.
  const onIframeLoad = (e) => {
    try {
      const title = e.target?.contentDocument?.title || '';
      if (/error|not\s*found|invalid/i.test(title)) setErrored(true);
    } catch {
      /* cross-origin — can't inspect, that's fine */
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={candidateName ? `${candidateName} — Resume` : 'Resume preview'}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span className="truncate">{url}</span>
          <div className="flex shrink-0 gap-2">
            {isCloudinary && mode === 'direct' && !errored && (
              <button
                type="button"
                onClick={() => { setMode('proxy'); setErrored(false); }}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs transition-all duration-150 ease-out hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm active:scale-95 dark:border-ink-700 dark:text-slate-200 dark:hover:border-ink-600 dark:hover:bg-ink-700"
                title="Use Google Docs viewer as a fallback"
              >
                <RefreshCw size={12} /> Use proxy
              </button>
            )}
            {isCloudinary && mode === 'proxy' && (
              <button
                type="button"
                onClick={() => { setMode('direct'); setErrored(false); }}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs transition-all duration-150 ease-out hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm active:scale-95 dark:border-ink-700 dark:text-slate-200 dark:hover:border-ink-600 dark:hover:bg-ink-700"
              >
                <RefreshCw size={12} /> Direct
              </button>
            )}
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs transition-all duration-150 ease-out hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm active:scale-95 dark:border-ink-700 dark:text-slate-200 dark:hover:border-ink-600 dark:hover:bg-ink-700"
            >
              <ExternalLink size={12} /> Open in new tab
            </a>
            <a
              href={url}
              download
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs transition-all duration-150 ease-out hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm active:scale-95 dark:border-ink-700 dark:text-slate-200 dark:hover:border-ink-600 dark:hover:bg-ink-700"
            >
              <Download size={12} /> Download
            </a>
          </div>
        </div>

        {errored ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-10 text-center text-sm text-amber-700">
            <AlertTriangle size={24} />
            <p className="font-medium">Could not display the PDF inline.</p>
            <p className="text-xs text-amber-600">
              This usually means the file URL is unreachable, the storage credentials are
              invalid, or the file isn't actually a PDF. Use the buttons above to open
              or download it.
            </p>
          </div>
        ) : (
          <div className="h-[70vh] overflow-hidden rounded-md border bg-slate-50">
            <iframe
              key={`${url}::${mode}`}
              src={iframeSrc}
              title="Resume preview"
              className="h-full w-full"
              onLoad={onIframeLoad}
              onError={() => setErrored(true)}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
