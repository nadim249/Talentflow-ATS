// src/pages/Kanban.jsx

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { candidatesAPI, jobsAPI, getApiErrorMessage } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

export default function Kanban() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [jobFilter, setJobFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch candidates and jobs together
  const loadKanbanData = useCallback(async () => {
    try {
      setLoading(true);
      const [candidatesData, jobsData] = await Promise.all([
        candidatesAPI.list(),
        jobsAPI.list(),
      ]);
      setCandidates(candidatesData);
      setJobs(jobsData);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load Kanban board'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKanbanData();
  }, [loadKanbanData]);

  // Filter candidates if a specific job filter is selected
  const filtered = useMemo(
    () => candidates.filter((c) => !jobFilter || c.appliedJob?._id === jobFilter),
    [candidates, jobFilter]
  );

  // Group candidates by their current pipeline stage
  const grouped = useMemo(() => {
    const stageMap = Object.fromEntries(STAGES.map((s) => [s, []]));
    filtered.forEach((c) => {
      (stageMap[c.stage] || stageMap.Applied).push(c);
    });
    return stageMap;
  }, [filtered]);

  // Move candidate to a different stage (optimistic UI update with rollback on error)
  const onChangeStage = async (card, nextStage) => {
    if (card.stage === nextStage) return;
    const previousStage = card.stage;

    // 1. Optimistic Update: Update state immediately so UI feels instant
    setCandidates((list) =>
      list.map((c) => (c._id === card._id ? { ...c, stage: nextStage } : c))
    );

    try {
      // 2. Persist to API
      await candidatesAPI.updateStage(card._id, nextStage);
      toast.success(`${card.name} → ${nextStage}`);
    } catch (err) {
      // 3. Rollback to previous state if API call failed
      setCandidates((list) =>
        list.map((c) => (c._id === card._id ? { ...c, stage: previousStage } : c))
      );
      toast.error(getApiErrorMessage(err, 'Failed to update candidate stage'));
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: Title, Job Filter & Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold dark:text-white">Kanban board</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Move candidates through the hiring pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="input rounded-md px-2 py-1.5 text-sm"
          >
            <option value="">All jobs</option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title}
              </option>
            ))}
          </select>
          <button
            onClick={loadKanbanData}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-sm transition-all duration-150 ease-out hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm active:scale-95 disabled:opacity-60 dark:border-ink-700 dark:text-slate-300 dark:hover:border-ink-600 dark:hover:bg-ink-700"
          >
            <RefreshCcw
              size={14}
              className={`transition-transform duration-300 ease-out ${loading ? 'animate-spin' : 'hover:rotate-180'}`}
            />{' '}
            Refresh
          </button>
        </div>
      </div>

      {/* 6 Stage Columns */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((stage) => (
          <Column
            key={stage}
            stage={stage}
            cards={grouped[stage] || []}
            onChangeStage={onChangeStage}
            onOpen={(c) => navigate(`/candidates/${c._id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function Column({ stage, cards, onChangeStage, onOpen }) {
  const total = cards.length;
  return (
    <div className="flex h-full min-h-[60vh] flex-col rounded-xl border border-slate-200 bg-slate-50/60 dark:border-ink-700 dark:bg-ink-900/40">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2 rounded-t-xl dark:border-ink-700 dark:bg-ink-800">
        <StatusBadge value={stage} />
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{total}</span>
      </div>
      <div className="flex-1 space-y-2 p-2">
        {cards.map((c) => (
          <Card key={c._id} card={c} onChangeStage={onChangeStage} onOpen={onOpen} />
        ))}
        {cards.length === 0 && (
          <div className="grid h-20 place-items-center rounded-md border border-dashed border-slate-300 text-xs text-slate-400 dark:border-ink-600 dark:text-slate-500">
            No candidates
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ card, onChangeStage, onOpen }) {
  const initials = card.name
    ?.split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'C';

  return (
    <div className="group rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-ink-700 dark:bg-ink-800 dark:hover:border-brand-500 dark:hover:shadow-lg dark:hover:shadow-brand-500/10">
      <div className="flex items-start gap-2">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-500 text-xs font-semibold text-white transition-transform duration-200 ease-out group-hover:scale-110">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <button
            onClick={() => onOpen(card)}
            className="block w-full truncate text-left text-sm font-medium text-slate-900 transition-colors duration-150 ease-out hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
          >
            {card.name}
          </button>
          <div className="truncate text-xs text-slate-500 dark:text-slate-400">
            {card.appliedJob?.title || '—'}
          </div>
        </div>
      </div>
      {card.skills?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {card.skills.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-ink-700 dark:text-slate-300"
            >
              {s}
            </span>
          ))}
        </div>
      )}
      {/* Stage Selector Dropdown */}
      <select
        value={card.stage}
        onChange={(e) => onChangeStage(card, e.target.value)}
        className="input mt-3 w-full rounded-md px-2 py-1 text-xs"
      >
        {STAGES.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}