// src/pages/Jobs.jsx

import { useEffect, useRef, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { jobsAPI, getApiErrorMessage } from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import RichTextEditor from '../components/RichTextEditor';

const EMPTY_JOB = {
  title: '',
  department: '',
  location: '',
  employmentType: 'Full-time',
  description: '',
  status: 'Active',
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: EMPTY_JOB });

  const descriptionRef = useRef(null);

  // Fetch jobs from the backend API
  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await jobsAPI.list({
        search: search.trim() || undefined,
        status: filter || undefined,
      });
      setJobs(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load jobs'));
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    loadJobs();
  }, [filter]); // Filter change triggers re-fetch

  // Open modal for creating a new job
  const openCreate = () => {
    setEditing(null);
    reset(EMPTY_JOB);
    setTimeout(() => descriptionRef.current?.setHtml(''), 0);
    setOpen(true);
  };

  // Open modal for editing an existing job
  const openEdit = (job) => {
    setEditing(job);
    reset(job);
    setTimeout(() => descriptionRef.current?.setHtml(job.description || ''), 0);
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  // Form submit handler for Create / Update
  const onSubmit = async (data) => {
    const description = descriptionRef.current?.getHtml() || '';
    if (!description || description === '<br>') {
      toast.error('Job description is required');
      return;
    }

    try {
      const payload = { ...data, description };
      if (editing) {
        await jobsAPI.update(editing._id, payload);
        toast.success('Job updated successfully');
      } else {
        await jobsAPI.create(payload);
        toast.success('Job created successfully');
      }
      closeModal();
      loadJobs();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save job'));
    }
  };

  // Toggle status between Active and Closed
  const toggleStatus = async (job) => {
    const nextStatus = job.status === 'Active' ? 'Closed' : 'Active';
    try {
      await jobsAPI.update(job._id, { status: nextStatus });
      toast.success(`Job marked as ${nextStatus}`);
      loadJobs();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not update status'));
    }
  };

  // Delete a job
  const removeJob = async (job) => {
    if (!confirm(`Are you sure you want to delete "${job.title}"?`)) return;
    try {
      await jobsAPI.remove(job._id);
      toast.success('Job deleted');
      loadJobs();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete job'));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Title and Add Job button */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold dark:text-white">Jobs</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1 rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/30 active:scale-95"
        >
          <Plus size={16} /> Add Job
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadJobs()}
          placeholder="Search by title or department..."
          className="input flex-1 min-w-[220px] rounded-md px-3 py-2 text-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input rounded-md px-3 py-2 text-sm"
        >
          <option value="">All status</option>
          <option value="Active">Active</option>
          <option value="Closed">Closed</option>
        </select>
        <button
          onClick={loadJobs}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm transition-all duration-150 ease-out hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm active:scale-95 dark:border-ink-700 dark:text-slate-200 dark:hover:border-ink-600 dark:hover:bg-ink-700"
        >
          Search
        </button>
      </div>

      {/* Jobs Data Table */}
      <DataTable
        columns={[
          { key: 'title', header: 'Title' },
          { key: 'department', header: 'Department' },
          { key: 'location', header: 'Location' },
          { key: 'employmentType', header: 'Type' },
          {
            key: 'status',
            header: 'Status',
            render: (job) => (
              <button
                onClick={() => toggleStatus(job)}
                title="Click to toggle status"
                className="transition-transform duration-150 ease-out hover:scale-105 active:scale-95"
              >
                <StatusBadge value={job.status} kind="job" />
              </button>
            ),
          },
          {
            key: 'actions',
            header: '',
            render: (job) => (
              <div className="flex justify-end gap-1">
                <button
                  onClick={() => openEdit(job)}
                  className="rounded p-1 text-slate-500 transition-all duration-150 ease-out hover:bg-slate-100 hover:text-brand-600 active:scale-90 dark:text-slate-300 dark:hover:bg-ink-700 dark:hover:text-brand-400"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => removeJob(job)}
                  className="rounded p-1 text-rose-600 transition-all duration-150 ease-out hover:bg-rose-50 hover:text-rose-700 active:scale-90 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ),
          },
        ]}
        rows={jobs}
        loading={loading}
      />

      {/* Add / Edit Job Modal */}
      <Modal open={open} title={editing ? 'Edit job' : 'Add job'} onClose={closeModal} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Basic information
            </h3>
            <Field label="Job title" error={errors.title?.message}>
              <input
                {...register('title', { required: 'Title is required' })}
                className={inputCls}
                placeholder="e.g. Senior Frontend Engineer"
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Department" error={errors.department?.message}>
                <input
                  {...register('department', { required: 'Department is required' })}
                  className={inputCls}
                  placeholder="e.g. Engineering"
                />
              </Field>
              <Field label="Location" error={errors.location?.message}>
                <input
                  {...register('location', { required: 'Location is required' })}
                  className={inputCls}
                  placeholder="e.g. Remote · EU"
                />
              </Field>
            </div>
            <Field label="Employment type">
              <select {...register('employmentType')} className={inputCls}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
                <option>Remote</option>
              </select>
            </Field>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Job description
              </h3>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Use the toolbar to format
              </span>
            </div>
            <Field label="Description">
              <RichTextEditor
                ref={descriptionRef}
                placeholder="Describe the role, responsibilities, and requirements..."
              />
            </Field>
          </section>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-ink-700">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm transition-all duration-150 ease-out hover:border-slate-300 hover:bg-slate-50 active:scale-95 dark:border-ink-700 dark:text-slate-200 dark:hover:border-ink-600 dark:hover:bg-ink-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/30 active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : editing ? 'Save changes' : 'Create job'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const inputCls = 'input w-full rounded-md px-3 py-2 text-sm';

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium dark:text-slate-200">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-rose-600 dark:text-rose-400">{error}</span>}
    </label>
  );
}