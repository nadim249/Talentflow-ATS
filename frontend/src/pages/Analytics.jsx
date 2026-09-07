// src/pages/Analytics.jsx
// Recruiter-only analytics dashboard powered by /api/analytics/overview.
import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Briefcase, Users, Star, Timer } from 'lucide-react';
import { analyticsAPI, getApiErrorMessage } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const STAGE_COLORS = {
  Applied: '#64748b',
  Screening: '#0ea5e9',
  Interview: '#8b5cf6',
  Offer: '#f59e0b',
  Hired: '#10b981',
  Rejected: '#ef4444',
};

const SOURCE_COLORS = { Hired: '#10b981', Rejected: '#ef4444', Open: '#0ea5e9' };

const PRESETS = [
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '365d', days: 365 },
];

function rangeFor(days) {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - days);
  return { from: from.toISOString(), to: to.toISOString() };
}

export default function Analytics() {
  const [range, setRange] = useState(() => rangeFor(90));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const dark = theme === 'dark';

  // Fetch analytics overview data
  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      try {
        setLoading(true);
        const result = await analyticsAPI.overview(range);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(err, 'Failed to load analytics data'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();
    return () => {
      cancelled = true;
    };
  }, [range]);

  const totals = data?.totals || { candidates: 0, hired: 0, open: 0, jobs: 0 };
  const pipeline = data?.pipeline || [];
  const timeInStage = useMemo(() => (data?.timeInStage || []).filter((r) => r.avgDays > 0), [data]);
  const sourceConversion = data?.sourceConversion || [];
  const topJobs = data?.topJobs || [];
  const avgDaysToHire = data?.avgDaysToHire || { avg: 0, n: 0 };

  const cards = [
    { label: 'Candidates', value: totals.candidates, Icon: Users, tint: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300' },
    { label: 'Jobs', value: totals.jobs, Icon: Briefcase, tint: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300' },
    { label: 'Hired', value: totals.hired, Icon: Star, tint: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300' },
    { label: 'Avg days to hire', value: avgDaysToHire.n ? `${avgDaysToHire.avg}d` : '—', Icon: Timer, tint: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300' },
  ];

  // Recharts colors — must be passed as props, the lib doesn't see Tailwind classes.
  const axisColor = dark ? '#94a3b8' : '#64748b';
  const gridColor = dark ? '#334155' : '#e2e8f0';
  const tooltipBg = dark ? '#1e293b' : '#fff';
  const tooltipBorder = dark ? '#334155' : '#e2e8f0';
  const tooltipText = dark ? '#e2e8f0' : '#0f172a';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold dark:text-white">Analytics</h1>
        <div className="flex gap-2">
          {PRESETS.map((p) => {
            const active = Math.round((new Date(range.to) - new Date(range.from)) / 86_400_000) === p.days;
            return (
              <button
                key={p.days}
                onClick={() => setRange(rangeFor(p.days))}
                className={`rounded-md border px-3 py-1.5 text-sm transition-all duration-150 ease-out active:scale-95 dark:border-ink-700 ${
                  active
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-500 dark:bg-brand-500/10 dark:text-brand-300'
                    : 'text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm dark:text-slate-300 dark:hover:border-ink-600 dark:hover:bg-ink-700'
                }`}
              >
                Last {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map(({ label, value, Icon, tint }) => (
          <div
            key={label}
            className="group rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-ink-700 dark:bg-ink-800 dark:hover:border-brand-500 dark:hover:shadow-lg dark:hover:shadow-brand-500/10"
          >
            <div className={`mb-3 inline-grid h-9 w-9 place-items-center rounded-md transition-transform duration-200 ease-out group-hover:scale-110 ${tint}`}>
              <Icon size={18} />
            </div>
            <div className="text-2xl font-semibold dark:text-white">{value}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Pipeline by stage" loading={loading} empty={pipeline.every((p) => p.count === 0)}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={pipeline}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="stage" stroke={axisColor} fontSize={12} />
              <YAxis allowDecimals={false} stroke={axisColor} fontSize={12} />
              <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {pipeline.map((p) => (
                  <Cell key={p.stage} fill={STAGE_COLORS[p.stage] || '#0ea5e9'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Source conversion" loading={loading} empty={sourceConversion.every((p) => p.count === 0)}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }} />
              <Legend wrapperStyle={{ color: axisColor, fontSize: 12 }} />
              <Pie
                data={sourceConversion}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={{ fill: axisColor }}
              >
                {sourceConversion.map((p) => (
                  <Cell key={p.label} fill={SOURCE_COLORS[p.label] || '#0ea5e9'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Avg days in stage" loading={loading} empty={timeInStage.length === 0}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={timeInStage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" stroke={axisColor} fontSize={12} />
              <YAxis type="category" dataKey="stage" stroke={axisColor} fontSize={12} width={80} />
              <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }} />
              <Bar dataKey="avgDays" radius={[0, 6, 6, 0]}>
                {timeInStage.map((p) => (
                  <Cell key={p.stage} fill={STAGE_COLORS[p.stage] || '#0ea5e9'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top jobs by candidates" loading={loading} empty={topJobs.length === 0}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topJobs} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" allowDecimals={false} stroke={axisColor} fontSize={12} />
              <YAxis type="category" dataKey="title" stroke={axisColor} fontSize={12} width={120} />
              <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }} />
              <Bar dataKey="count" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {data?.range && (
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Range: {new Date(data.range.from).toLocaleDateString()} — {new Date(data.range.to).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

function ChartCard({ title, loading, empty, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-ink-700 dark:bg-ink-800">
      <div className="mb-3 text-sm font-semibold dark:text-white">{title}</div>
      {loading ? (
        <div className="h-[260px] animate-pulse rounded-md bg-slate-100 dark:bg-ink-700" />
      ) : empty ? (
        <div className="grid h-[260px] place-items-center text-sm text-slate-500 dark:text-slate-400">No data in this range.</div>
      ) : (
        children
      )}
    </div>
  );
}