// src/pages/Interviews.jsx

import { useEffect, useMemo, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { interviewsAPI, getApiErrorMessage } from '../services/api';
import InterviewModal from '../components/InterviewModal';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [cursor, setCursor] = useState(() => new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all interviews
  const loadInterviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await interviewsAPI.list();
      setInterviews(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load interviews'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  // Build the month grid (6 weeks × 7 days) starting from the first Sunday on/before day 1.
  const monthDays = useMemo(() => {
    const first = startOfMonth(cursor);
    const last = endOfMonth(cursor);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    const days = [];
    for (let i = 0; i < 42; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({ date: d, inMonth: d.getMonth() === cursor.getMonth() });
      if (i >= 34 && d > last && d.getDay() === 6) break;
    }
    return days;
  }, [cursor]);

  // Bucket interviews by YYYY-MM-DD for fast lookup.
  const byDay = useMemo(() => {
    const map = new Map();
    for (const iv of interviews) {
      const key = new Date(iv.scheduledAt).toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(iv);
    }
    return map;
  }, [interviews]);

  // Next 14 days agenda
  const agenda = useMemo(() => {
    const now = Date.now();
    const horizon = now + 14 * 86_400_000;
    return interviews
      .filter((iv) => {
        const t = new Date(iv.scheduledAt).getTime();
        return t >= now - 86_400_000 && t <= horizon;
      })
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  }, [interviews]);

  // Delete an interview
  const onDelete = async (iv) => {
    if (!confirm('Are you sure you want to delete this interview?')) return;
    try {
      await interviewsAPI.remove(iv._id);
      toast.success('Interview deleted');
      loadInterviews();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not delete interview'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold dark:text-white">Interviews</h1>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/30 active:scale-95"
        >
          <Plus size={16} /> New interview
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Month View Calendar */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-card dark:border-ink-700 dark:bg-ink-800 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-ink-700">
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="rounded p-1 text-slate-500 transition-all duration-150 ease-out hover:bg-slate-100 hover:text-brand-600 active:scale-90 dark:text-slate-300 dark:hover:bg-ink-700 dark:hover:text-brand-400"
              title="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-sm font-semibold dark:text-white">
              {cursor.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="rounded p-1 text-slate-500 transition-all duration-150 ease-out hover:bg-slate-100 hover:text-brand-600 active:scale-90 dark:text-slate-300 dark:hover:bg-ink-700 dark:hover:text-brand-400"
              title="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-medium uppercase tracking-wide text-slate-500 dark:border-ink-700 dark:bg-ink-700 dark:text-slate-400">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-2">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map(({ date, inMonth }) => {
              const key = date.toISOString().slice(0, 10);
              const items = byDay.get(key) || [];
              const today = new Date().toDateString() === date.toDateString();
              return (
                <div
                  key={key}
                  className={`min-h-[88px] border-b border-r border-slate-200 p-1.5 text-xs transition-colors duration-150 ease-out dark:border-ink-700 ${
                    inMonth
                      ? 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-ink-800 dark:text-slate-200 dark:hover:bg-ink-700'
                      : 'bg-slate-50 text-slate-400 dark:bg-ink-900 dark:text-slate-500'
                  }`}
                >
                  <div
                    className={`mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full ${
                      today ? 'bg-brand-500 text-white' : ''
                    }`}
                  >
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {items.slice(0, 3).map((iv) => (
                      <button
                        key={iv._id}
                        onClick={() => {
                          setEditing(iv);
                          setModalOpen(true);
                        }}
                        className="block w-full truncate rounded bg-brand-50 px-1.5 py-0.5 text-left text-[11px] text-brand-700 transition-colors duration-150 ease-out hover:bg-brand-100 hover:font-semibold dark:bg-brand-500/20 dark:text-brand-100 dark:hover:bg-brand-500/30"
                        title={`${iv.candidate?.name} — ${iv.mode}`}
                      >
                        {new Date(iv.scheduledAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        {iv.candidate?.name}
                      </button>
                    ))}
                    {items.length > 3 && (
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        +{items.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 14-day upcoming agenda */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-card dark:border-ink-700 dark:bg-ink-800">
          <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold dark:border-ink-700 dark:text-white">
            Next 14 days
          </div>
          <ul className="divide-y divide-slate-200 dark:divide-ink-700">
            {agenda.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {loading ? 'Loading...' : 'Nothing scheduled.'}
              </li>
            )}
            {agenda.map((iv) => (
              <li
                key={iv._id}
                className="group flex items-center justify-between px-4 py-3 text-sm transition-colors duration-150 ease-out hover:bg-slate-50 dark:hover:bg-ink-700"
              >
                <div>
                  <div className="font-medium dark:text-white">
                    {iv.candidate?.name || 'Candidate'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(iv.scheduledAt).toLocaleString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · {iv.mode} · {iv.job?.title || 'Job'}
                  </div>
                </div>
                <div className="flex gap-1 opacity-70 transition-opacity duration-150 ease-out group-hover:opacity-100">
                  <button
                    onClick={() => {
                      setEditing(iv);
                      setModalOpen(true);
                    }}
                    className="rounded p-1 text-slate-500 transition-colors duration-150 ease-out hover:bg-slate-200 hover:text-brand-600 active:scale-90 dark:text-slate-300 dark:hover:bg-ink-600 dark:hover:text-brand-400"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(iv)}
                    className="rounded p-1 text-red-500 transition-colors duration-150 ease-out hover:bg-red-50 hover:text-red-600 active:scale-90 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <InterviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadInterviews}
        initialData={editing}
      />
    </div>
  );
}
