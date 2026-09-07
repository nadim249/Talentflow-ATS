// src/pages/Dashboard.jsx

import { useEffect, useState } from 'react';
import { Briefcase, Users, Star, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';
import toast from 'react-hot-toast';
import { candidatesAPI, jobsAPI, getApiErrorMessage } from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const createCards = (metrics) => [
  { label: 'Total Jobs', value: metrics.jobs, Icon: Briefcase, tint: 'bg-sky-50 text-sky-600' },
  { label: 'Candidates', value: metrics.candidates, Icon: Users, tint: 'bg-violet-50 text-violet-600' },
  { label: 'Offers', value: metrics.offers, Icon: Star, tint: 'bg-amber-50 text-amber-600' },
  { label: 'Hired', value: metrics.hired, Icon: CheckCircle2, tint: 'bg-emerald-50 text-emerald-600' },
];

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ jobs: 0, candidates: 0, offers: 0, hired: 0 });
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        // Fetch jobs and candidates concurrently using Promise.all
        const [jobs, candidates] = await Promise.all([
          jobsAPI.list(),
          candidatesAPI.list(),
        ]);

        setMetrics({
          jobs: jobs.length,
          candidates: candidates.length,
          offers: candidates.filter((c) => c.stage === 'Offer').length,
          hired: candidates.filter((c) => c.stage === 'Hired').length,
        });

        // Show latest 5 entries
        setRecentCandidates(candidates.slice(0, 5));
        setRecentJobs(jobs.slice(0, 5));
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to load dashboard data'));
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold dark:text-white">Dashboard</h1>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {createCards(metrics).map(({ label, value, Icon, tint }) => (
          <div
            key={label}
            className="group rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-ink-700 dark:bg-ink-800 dark:hover:border-brand-500 dark:hover:shadow-lg dark:hover:shadow-brand-500/10"
          >
            <div
              className={`mb-3 inline-grid h-9 w-9 place-items-center rounded-md transition-transform duration-200 ease-out group-hover:scale-110 ${tint}`}
            >
              <Icon size={18} />
            </div>
            <div className="text-2xl font-semibold dark:text-white">
              {loading ? '—' : value}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Candidates & Jobs Tables */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Candidates */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold dark:text-white">Recent candidates</h2>
            <Link
              to="/candidates"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors duration-150 ease-out hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              View all
              <span className="transition-transform duration-150 ease-out group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
          <DataTable
            loading={loading}
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'email', header: 'Email' },
              { key: 'stage', header: 'Stage', render: (r) => <StatusBadge value={r.stage} /> },
            ]}
            rows={recentCandidates}
          />
        </div>

        {/* Recent Jobs */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold dark:text-white">Recent jobs</h2>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors duration-150 ease-out hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              View all
              <span className="transition-transform duration-150 ease-out group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
          <DataTable
            loading={loading}
            columns={[
              { key: 'title', header: 'Title' },
              { key: 'department', header: 'Department' },
              {
                key: 'status',
                header: 'Status',
                render: (r) => <StatusBadge value={r.status} kind="job" />,
              },
            ]}
            rows={recentJobs}
          />
        </div>
      </div>
    </div>
  );
}