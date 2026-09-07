// src/components/AppLayout.jsx
// Sidebar + top nav + routed <Outlet/>.
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-ink-900">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}