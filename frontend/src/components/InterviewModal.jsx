// src/components/InterviewModal.jsx
// Create or edit an interview. Supports initialData for edit mode.
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { candidatesAPI, jobsAPI, interviewsAPI, getApiErrorMessage } from '../services/api';

const MODES = ['Phone', 'Video', 'Onsite'];
const STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'No-show'];

// Convert an ISO date to the value <input type="datetime-local"> expects.
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const tzOffset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

export default function InterviewModal({ open, onClose, onSaved, initialData, defaultCandidateId, defaultJobId }) {
  const editing = Boolean(initialData?._id);

  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      candidate: defaultCandidateId || '',
      job: defaultJobId || '',
      scheduledAt: '',
      durationMinutes: 30,
      mode: 'Video',
      interviewer: '',
      locationOrLink: '',
      status: 'Scheduled',
      notes: '',
    },
  });

  const selectedCandidateId = watch('candidate');

  // Reset whenever the modal opens or the target changes.
  useEffect(() => {
    if (!open) return;
    if (editing) {
      reset({
        candidate: initialData.candidate?._id || initialData.candidate || '',
        job: initialData.job?._id || initialData.job || defaultJobId || '',
        scheduledAt: toLocalInput(initialData.scheduledAt),
        durationMinutes: initialData.durationMinutes || 30,
        mode: initialData.mode || 'Video',
        interviewer: initialData.interviewer || '',
        locationOrLink: initialData.locationOrLink || '',
        status: initialData.status || 'Scheduled',
        notes: initialData.notes || '',
      });
    } else {
      reset({
        candidate: defaultCandidateId || '',
        job: defaultJobId || '',
        scheduledAt: '',
        durationMinutes: 30,
        mode: 'Video',
        interviewer: '',
        locationOrLink: '',
        status: 'Scheduled',
        notes: '',
      });
    }
    /* eslint-disable-next-line */
  }, [open, initialData, defaultCandidateId, defaultJobId]);

  // Lazy-load candidates + jobs every time the modal opens in create mode.
  useEffect(() => {
    if (!open || editing) return;
    let cancelled = false;
    Promise.all([candidatesAPI.list(), jobsAPI.list()])
      .then(([candList, jobList]) => {
        if (cancelled) return;
        setCandidates(candList || []);
        setJobs(jobList || []);
        // If a default candidate was passed and the job wasn't, fill it in.
        if (defaultCandidateId && !defaultJobId) {
          const found = (candList || []).find((c) => c._id === defaultCandidateId);
          if (found?.appliedJob?._id) setValue('job', found.appliedJob._id);
        }
      })
      .catch((err) => {
        console.error('Failed to load interview modal lists', err);
        toast.error('Could not load candidates/jobs');
      });
    return () => { cancelled = true; };
  }, [open, editing, defaultCandidateId, defaultJobId, setValue]);

  // Auto-fill job from the chosen candidate (create mode only).
  useEffect(() => {
    if (editing) return;
    const found = candidates.find((c) => c._id === selectedCandidateId);
    if (found?.appliedJob?._id) setValue('job', found.appliedJob._id);
  }, [selectedCandidateId, editing, candidates, setValue]);

  const candidateOptions = candidates;

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        durationMinutes: Number(values.durationMinutes) || 30,
      };
      let saved;
      if (editing) {
        saved = await interviewsAPI.update(initialData._id, payload);
        toast.success('Interview updated');
      } else {
        saved = await interviewsAPI.create(payload);
        toast.success('Interview scheduled');
      }
      onSaved?.(saved);
      onClose?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not save interview'));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit interview' : 'Schedule interview'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Candidate *" error={errors.candidate?.message}>
          <select
            {...register('candidate', { required: 'Candidate is required' })}
            className="input"
          >
            <option value="">Select a candidate…</option>
            {candidateOptions.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} — {c.email}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Job *" error={errors.job?.message}>
          <select
            {...register('job', { required: 'Job is required' })}
            className="input"
          >
            <option value="">Select a job…</option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title}{j.department ? ` — ${j.department}` : ''}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="When *" error={errors.scheduledAt?.message}>
            <input
              type="datetime-local"
              {...register('scheduledAt', { required: 'Date and time are required' })}
              className="input"
            />
          </Field>
          <Field label="Duration (min)" error={errors.durationMinutes?.message}>
            <input
              type="number"
              min="5"
              max="480"
              {...register('durationMinutes', {
                min: { value: 5, message: 'Min 5 min' },
                max: { value: 480, message: 'Max 8 hours' },
              })}
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Mode">
            <select {...register('mode')} className="input">
              {MODES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select {...register('status')} className="input">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Interviewer">
          <input
            {...register('interviewer')}
            className="input"
            placeholder="e.g. Jane Doe"
          />
        </Field>

        <Field label="Location or video link">
          <input
            {...register('locationOrLink')}
            className="input"
            placeholder="Zoom link, address, or phone"
          />
        </Field>

        <Field label="Notes">
          <textarea
            {...register('notes')}
            className="input"
            rows={3}
            placeholder="Anything the interviewer should know…"
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm transition-all duration-150 ease-out hover:border-slate-300 hover:bg-slate-50 active:scale-95 dark:border-ink-700 dark:text-slate-200 dark:hover:border-ink-600 dark:hover:bg-ink-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/30 active:scale-95 disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : editing ? 'Save changes' : 'Schedule'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
