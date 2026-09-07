// src/pages/Candidates.jsx

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { candidatesAPI, jobsAPI, getApiErrorMessage } from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm();
  const navigate = useNavigate();

  // Load the list of candidates matching current search & stage filters
  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await candidatesAPI.list({
        search: search.trim() || undefined,
        stage: stage || undefined,
      });
      setCandidates(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load candidates'));
    } finally {
      setLoading(false);
    }
  }, [search, stage]);

  // Load active jobs for the job assignment dropdown in the modal
  const loadJobs = async () => {
    try {
      const data = await jobsAPI.list();
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  // Initial load
  useEffect(() => {
    loadJobs();
  }, []);

  // Re-load candidates whenever the stage filter changes or on initial render
  useEffect(() => {
    loadCandidates();
  }, [stage]);

  // Filter jobs to only show Active ones in the application dropdown
  const jobOptions = useMemo(() => jobs.filter((j) => j.status === 'Active'), [jobs]);

  // Form submit: prepares multipart FormData including PDF file
  const onSubmit = async (values) => {
    if (!values.resume?.[0]) {
      toast.error('Resume is required (PDF, max 5MB)');
      return;
    }

    try {
      const fd = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          fd.append(key, val);
        }
      });
      fd.append('resume', values.resume[0]);

      await candidatesAPI.create(fd);
      toast.success('Candidate added successfully');
      reset();
      setOpen(false);
      loadCandidates();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create candidate'));
    }
  };

  // Remove candidate
  const removeCandidate = async (candidate) => {
    if (!confirm(`Are you sure you want to delete "${candidate.name}"?`)) return;
    try {
      await candidatesAPI.remove(candidate._id);
      toast.success('Candidate deleted');
      loadCandidates();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete candidate'));
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold dark:text-white">Candidates</h1>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/30 active:scale-95"
        >
          <Plus size={16} /> Add Candidate
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadCandidates()}
          placeholder="Search name, email, or skill..."
          className="input flex-1 min-w-[220px] rounded-md px-3 py-2 text-sm"
        />
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="input rounded-md px-3 py-2 text-sm"
        >
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={loadCandidates}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm transition-all duration-150 ease-out hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm active:scale-95 dark:border-ink-700 dark:text-slate-200 dark:hover:border-ink-600 dark:hover:bg-ink-700"
        >
          Search
        </button>
      </div>

      {/* Candidates Data Table */}
      <DataTable
        rows={candidates}
        loading={loading}
        onRowClick={(candidate) => navigate(`/candidates/${candidate._id}`)}
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'email', header: 'Email' },
          {
            key: 'skills',
            header: 'Skills',
            render: (r) => (r.skills || []).slice(0, 3).join(', ') || '—',
          },
          {
            key: 'appliedJob',
            header: 'Job',
            render: (r) => r.appliedJob?.title || '—',
          },
          {
            key: 'stage',
            header: 'Stage',
            render: (r) => <StatusBadge value={r.stage} />,
          },
          {
            key: 'actions',
            header: '',
            render: (r) => (
              <div className="flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCandidate(r);
                  }}
                  className="rounded p-1 text-rose-600 transition-all duration-150 ease-out hover:bg-rose-50 hover:text-rose-700 active:scale-90 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* Add Candidate Modal */}
      <Modal open={open} title="Add candidate" onClose={() => setOpen(false)} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Full name">
            <input {...register('name', { required: true })} className={inputCls} placeholder="John Doe" />
          </Field>
          <Field label="Email">
            <input type="email" {...register('email', { required: true })} className={inputCls} placeholder="john@example.com" />
          </Field>
          <Field label="Phone">
            <input {...register('phone')} className={inputCls} placeholder="+1 (555) 012-3456" />
          </Field>
          <Field label="Experience (years)">
            <input type="number" min="0" {...register('experience')} className={inputCls} placeholder="3" />
          </Field>
          <Field label="Skills (comma-separated)">
            <input {...register('skills')} className={inputCls} placeholder="React, Node.js, TypeScript" />
          </Field>
          <Field label="Education">
            <input {...register('education')} className={inputCls} placeholder="B.S. in Computer Science" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Applied job">
              <select {...register('appliedJob', { required: true })} className={inputCls}>
                <option value="">Select a job</option>
                {jobOptions.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} — {j.department}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Stage">
              <select {...register('stage')} className={inputCls}>
                {STAGES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium dark:text-slate-200">
              Resume <span className="text-rose-600 dark:text-rose-400">*</span>{' '}
              <span className="font-normal text-slate-400 dark:text-slate-500">(PDF, max 5MB)</span>
            </label>
            <input
              type="file"
              accept="application/pdf"
              {...register('resume', { required: 'Resume is required' })}
              className="block w-full text-sm text-slate-700 dark:text-slate-200 file:mr-3 file:rounded-md file:border-0 file:bg-brand-500 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-600"
            />
            {errors.resume && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.resume.message}</p>
            )}
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm transition-all duration-150 ease-out hover:border-slate-300 hover:bg-slate-50 active:scale-95 dark:border-ink-700 dark:text-slate-200 dark:hover:border-ink-600 dark:hover:bg-ink-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/30 active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : 'Create candidate'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const inputCls = 'input w-full rounded-md px-3 py-2 text-sm';
function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium dark:text-slate-200">{label}</span>
      {children}
    </label>
  );
}