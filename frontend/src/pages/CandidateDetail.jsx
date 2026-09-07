// src/pages/CandidateDetail.jsx

import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import toast from 'react-hot-toast';
import { FileText, ArrowLeft, Plus, CalendarPlus, Pencil, Trash2, Eye } from 'lucide-react';
import { candidatesAPI, interviewsAPI, getApiErrorMessage } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import InterviewModal from '../components/InterviewModal';
import ResumePreviewModal from '../components/ResumePreviewModal';

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

export default function CandidateDetail() {
  const { id } = useParams(); // URL parameter from React Router: /candidates/:id
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');
  const [interviews, setInterviews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch candidate details
  const loadCandidate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await candidatesAPI.get(id);
      setCandidate(data);
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to load candidate profile');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch interviews associated with this candidate
  const loadInterviews = useCallback(async () => {
    try {
      const data = await interviewsAPI.list({ candidateId: id });
      setInterviews(data);
    } catch (err) {
      console.error('Error loading candidate interviews:', err);
    }
  }, [id]);

  useEffect(() => {
    loadCandidate();
    loadInterviews();
  }, [loadCandidate, loadInterviews]);

  // Handle stage change dropdown
  const changeStage = async (e) => {
    const nextStage = e.target.value;
    try {
      const updated = await candidatesAPI.updateStage(id, nextStage);
      setCandidate(updated);
      toast.success(`Candidate moved to ${nextStage}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update stage'));
    }
  };

  // Add a new note
  const addNote = async (e) => {
    e.preventDefault();
    const cleanNote = note.trim();
    if (!cleanNote) return;

    try {
      const updated = await candidatesAPI.addNote(id, cleanNote);
      setCandidate(updated);
      setNote('');
      toast.success('Note added');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not add note'));
    }
  };

  // Delete an interview
  const onDeleteInterview = async (iv) => {
    if (!confirm('Are you sure you want to delete this interview?')) return;
    try {
      await interviewsAPI.remove(iv._id);
      toast.success('Interview deleted');
      loadInterviews();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not delete interview'));
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400">
        Loading candidate profile...
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-rose-600 dark:text-rose-400">{error || 'Candidate not found.'}</p>
        <Link
          to="/candidates"
          className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline dark:text-brand-400"
        >
          <ArrowLeft size={14} /> Back to candidates
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/candidates"
        className="group inline-flex items-center gap-1 text-sm text-slate-500 transition-colors duration-150 ease-out hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft size={14} className="transition-transform duration-150 ease-out group-hover:-translate-x-1" />
        Back to candidates
      </Link>

      {/* Profile Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-ink-700 dark:bg-ink-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold dark:text-white">{candidate.name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {candidate.email} · {candidate.phone || 'No phone'}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <span className="text-slate-500 dark:text-slate-400">Applied to:</span>
              <strong className="dark:text-white">{candidate.appliedJob?.title || '—'}</strong>
              <span className="text-slate-400 dark:text-slate-500">·</span>
              <span className="dark:text-slate-300">{candidate.appliedJob?.department || ''}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge value={candidate.stage} />
            <select
              value={candidate.stage}
              onChange={changeStage}
              className="input rounded-md px-2 py-1 text-sm"
            >
              {STAGES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Info label="Experience" value={`${candidate.experience || 0} years`} />
          <Info label="Education" value={candidate.education || '—'} />
          <Info label="Skills" value={(candidate.skills || []).join(', ') || '—'} />
        </div>

        {candidate.resumeUrl && (
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/30 active:scale-95"
            >
              <Eye size={16} /> Preview resume
            </button>
            <a
              href={candidate.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm transition-all duration-150 ease-out hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm active:scale-95 dark:border-ink-700 dark:text-slate-200 dark:hover:border-ink-600 dark:hover:bg-ink-700"
            >
              <FileText size={16} /> Open in new tab
            </a>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-ink-700 dark:bg-ink-800">
        <h2 className="mb-3 font-semibold dark:text-white">Notes</h2>
        <form onSubmit={addNote} className="mb-4 flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a quick note..."
            className="input flex-1 rounded-md px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/30 active:scale-95"
          >
            <Plus size={14} /> Add
          </button>
        </form>
        <ul className="space-y-2">
          {(candidate.notes || []).length === 0 && (
            <li className="text-sm text-slate-500 dark:text-slate-400">No notes yet.</li>
          )}
          {(candidate.notes || [])
            .slice()
            .reverse()
            .map((n, i) => (
              <li key={i} className="rounded-md bg-slate-50 px-3 py-2 text-sm dark:bg-ink-700">
                <p className="dark:text-slate-100">{n.text}</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
        </ul>
      </div>

      {/* Interviews Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-ink-700 dark:bg-ink-800">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold dark:text-white">Interviews</h2>
          <button
            onClick={() => {
              setEditingInterview(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1 rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/30 active:scale-95"
          >
            <CalendarPlus size={14} /> Schedule interview
          </button>
        </div>
        <ul className="space-y-2">
          {interviews.length === 0 && (
            <li className="text-sm text-slate-500 dark:text-slate-400">No interviews scheduled yet.</li>
          )}
          {interviews.map((iv) => (
            <li
              key={iv._id}
              className="group flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm transition-colors duration-150 ease-out hover:bg-slate-100 dark:bg-ink-700 dark:hover:bg-ink-600"
            >
              <div>
                <div className="font-medium dark:text-white">
                  {new Date(iv.scheduledAt).toLocaleString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  · {iv.mode}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {iv.interviewer || 'No interviewer'} · {iv.job?.title || ''} · {iv.status}
                </div>
                {iv.notes && (
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{iv.notes}</div>
                )}
              </div>
              <div className="flex gap-1 opacity-70 transition-opacity duration-150 ease-out group-hover:opacity-100">
                <button
                  onClick={() => {
                    setEditingInterview(iv);
                    setModalOpen(true);
                  }}
                  className="rounded p-1 text-slate-500 transition-all duration-150 ease-out hover:bg-white hover:text-brand-600 active:scale-90 dark:text-slate-300 dark:hover:bg-ink-800 dark:hover:text-brand-400"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onDeleteInterview(iv)}
                  className="rounded p-1 text-red-500 transition-all duration-150 ease-out hover:bg-white hover:text-red-600 active:scale-90 dark:hover:bg-ink-800 dark:hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Schedule / Edit Interview Modal */}
      <InterviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadInterviews}
        initialData={editingInterview}
        defaultCandidateId={candidate._id}
        defaultJobId={candidate.appliedJob?._id || candidate.appliedJob}
      />

      {/* Resume Preview Modal */}
      <ResumePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        url={candidate.resumeUrl}
        candidateName={candidate.name}
      />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</div>
      <div className="mt-1 text-sm dark:text-slate-100">{value}</div>
    </div>
  );
}