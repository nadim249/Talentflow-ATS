// src/public/JobBoard.jsx
// Public listing of active jobs for prospective candidates.
// Clean async/await, unified error handling, and beginner-friendly structure.

import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { MapPin, Briefcase, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { publicAPI, getApiErrorMessage } from '../services/api';

// Helper to strip HTML tags for preview snippet
function stripHtml(html = '') {
  return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch open jobs from the public API
  useEffect(() => {
    async function loadOpenJobs() {
      try {
        setLoading(true);
        const data = await publicAPI.listJobs();
        setJobs(data);
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to load open jobs'));
      } finally {
        setLoading(false);
      }
    }

    loadOpenJobs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold dark:text-white">Open roles</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Find a role that fits and apply in minutes.
        </p>
      </div>

      {loading ? (
        <div className="grid place-items-center py-12 text-slate-500 dark:text-slate-400">
          Loading open roles...
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-card dark:border-ink-700 dark:bg-ink-800 dark:text-slate-400">
          No openings right now. Check back soon.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {jobs.map((job) => (
            <Link
              key={job._id}
              to={`/jobs-board/${job._id}/apply`}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-ink-700 dark:bg-ink-800 dark:hover:border-brand-500 dark:hover:shadow-lg dark:hover:shadow-brand-500/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold transition-colors duration-150 ease-out group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
                    {job.title}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{job.department}</p>
                </div>
                <ArrowRight
                  size={18}
                  className="text-slate-400 transition-all duration-200 ease-out group-hover:translate-x-1 group-hover:text-brand-500"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1">
                  <Briefcase size={14} /> {job.employmentType}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin size={14} /> {job.location}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                {stripHtml(job.description)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
