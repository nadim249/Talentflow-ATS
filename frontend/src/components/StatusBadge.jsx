// src/components/StatusBadge.jsx
// Centralized color map for stages and job status.
const STAGE_COLORS = {
  Applied: 'bg-slate-100 text-slate-700',
  Screening: 'bg-sky-100 text-sky-700',
  Interview: 'bg-violet-100 text-violet-700',
  Offer: 'bg-amber-100 text-amber-700',
  Hired: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-rose-100 text-rose-700',
};

const JOB_COLORS = {
  Active: 'bg-emerald-100 text-emerald-700',
  Closed: 'bg-slate-200 text-slate-700',
};

export default function StatusBadge({ value, kind = 'stage' }) {
  const map = kind === 'job' ? JOB_COLORS : STAGE_COLORS;
  const color = map[value] || 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {value}
    </span>
  );
}