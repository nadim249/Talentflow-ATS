// src/components/Sidebar.jsx
import { LayoutDashboard, Briefcase, Users, KanbanSquare, ListChecks, Calendar, BarChart3 } from 'lucide-react';
import { NavLink } from 'react-router';

const linkClass = ({ isActive }) =>
  `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ease-out ${
    isActive
      ? 'bg-brand-50 text-brand-700 shadow-sm dark:bg-brand-500/15 dark:text-brand-200'
      : 'text-slate-600 hover:translate-x-0.5 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-ink-700 dark:hover:text-white'
  }`;

export default function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 md:block dark:border-ink-700 dark:bg-ink-800">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-brand-500 text-white transition-transform duration-200 ease-out hover:rotate-6 hover:scale-105">
          <ListChecks size={18} />
        </div>
        <span className="text-lg font-semibold dark:text-white">TalentFlow</span>
      </div>
      <nav className="space-y-1">
        <NavLink to="/dashboard" className={linkClass}>
          <LayoutDashboard size={18} className="transition-transform duration-150 ease-out group-hover:scale-110" /> Dashboard
        </NavLink>
        <NavLink to="/jobs" className={linkClass}>
          <Briefcase size={18} className="transition-transform duration-150 ease-out group-hover:scale-110" /> Jobs
        </NavLink>
        <NavLink to="/candidates" className={linkClass}>
          <Users size={18} className="transition-transform duration-150 ease-out group-hover:scale-110" /> Candidates
        </NavLink>
        <NavLink to="/kanban" className={linkClass}>
          <KanbanSquare size={18} className="transition-transform duration-150 ease-out group-hover:scale-110" /> Kanban
        </NavLink>
        <NavLink to="/interviews" className={linkClass}>
          <Calendar size={18} className="transition-transform duration-150 ease-out group-hover:scale-110" /> Calendar
        </NavLink>
        <NavLink to="/analytics" className={linkClass}>
          <BarChart3 size={18} className="transition-transform duration-150 ease-out group-hover:scale-110" /> Analytics
        </NavLink>
      </nav>
    </aside>
  );
}
