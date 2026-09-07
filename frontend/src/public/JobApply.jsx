// src/public/JobApply.jsx
// Public job application form.
// Posts multipart/form-data with resume PDF to /public/apply/:jobId.
// Uses modern React Router hooks and getApiErrorMessage.

import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { publicAPI, getApiErrorMessage } from '../services/api';

const inputCls =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors duration-150 ease-out placeholder:text-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-ink-600 dark:bg-ink-800 dark:text-slate-100 dark:placeholder:text-slate-500';

export default function JobApply() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Load job details
  useEffect(() => {
    async function loadJobDetails() {
      try {
        setLoading(true);
        const data = await publicAPI.getJob(jobId);
        setJob(data);
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Could not find the requested job'));
        navigate('/jobs-board', { replace: true });
      } finally {
        setLoading(false);
      }
    }

    if (jobId) {
      loadJobDetails();
    }
  }, [jobId, navigate]);

  // Submit candidate application
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

      await publicAPI.apply(jobId, fd);
      setDone(true);
      toast.success('Application submitted successfully!');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to submit application'));
    }
  };

  // Success state
  if (done) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-card dark:border-ink-700 dark:bg-ink-800">
        <CheckCircle2 size={36} className="mx-auto mb-3 text-emerald-500" />
        <h1 className="text-xl font-semibold dark:text-white">Thanks for applying!</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Our team will review your application and follow up by email.
        </p>
        <button
          onClick={() => navigate('/jobs-board')}
          className="mt-5 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/30 active:scale-95"
        >
          Back to jobs
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400">
        Loading role details...
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Back to jobs link */}
      <Link
        to="/jobs-board"
        className="group inline-flex items-center gap-1 text-sm text-slate-500 transition-colors duration-150 ease-out hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft size={14} className="transition-transform duration-150 ease-out group-hover:-translate-x-1" />
        Back to jobs
      </Link>

      {/* Role overview card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-ink-700 dark:bg-ink-800">
        <h1 className="text-xl font-semibold dark:text-white">{job.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {job.department} · {job.location} · {job.employmentType}
        </p>
        <div
          className="prose-content mt-3 text-sm text-slate-600 dark:text-slate-300"
          dangerouslySetInnerHTML={{ __html: job.description || '' }}
        />
      </div>

      {/* Application form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-ink-700 dark:bg-ink-800"
      >
        <h2 className="mb-4 font-semibold dark:text-white">Apply for this role</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Full name" error={errors.name?.message}>
            <input
              {...register('name', { required: 'Full name is required' })}
              className={inputCls}
              placeholder="Jane Doe"
            />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className={inputCls}
              placeholder="jane@example.com"
            />
          </Field>
          <Field label="Phone">
            <input {...register('phone')} className={inputCls} placeholder="+1 (555) 123-4567" />
          </Field>
          <Field label="Experience (years)">
            <input type="number" min="0" {...register('experience')} className={inputCls} placeholder="3" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Skills (comma-separated)">
              <input {...register('skills')} className={inputCls} placeholder="React, Node.js, SQL" />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Education">
              <input {...register('education')} className={inputCls} placeholder="Degree, University" />
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
              className="block w-full text-sm text-slate-700 transition-colors duration-150 ease-out file:mr-3 file:rounded-md file:border-0 file:bg-brand-500 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-600 dark:text-slate-200"
            />
            {errors.resume && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.resume.message}</p>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 w-full rounded-md bg-brand-500 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/30 active:scale-95 disabled:opacity-60 md:w-auto md:px-6"
        >
          {isSubmitting ? 'Submitting...' : 'Submit application'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium dark:text-slate-200">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-rose-600 dark:text-rose-400">{error}</span>}
    </label>
  );
}