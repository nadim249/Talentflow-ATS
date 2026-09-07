# TalentFlow ATS — Frontend

React (Vite, JavaScript) + Tailwind. Talks to the backend at `VITE_API_URL`.

## Setup

```bash
cd talentflow/frontend
cp .env.example .env       # set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                # http://localhost:5173
```

## Scripts

| Script           | What it does                          |
| ---------------- | ------------------------------------- |
| `npm run dev`    | Vite dev server with HMR              |
| `npm run build`  | Production build into `dist/`         |
| `npm run preview`| Preview the production build          |

## Project layout

```
src/
  components/     AppLayout, Sidebar, Navbar, Modal, StatusBadge, DataTable, ProtectedRoute
  context/        AuthContext.jsx
  pages/          Login, Register, Dashboard, Jobs, Candidates, CandidateDetail, Kanban, Interviews, Analytics
  services/       api.js (Axios instance + grouped helpers)
  App.jsx         Routes
  main.jsx        Bootstrap
```

## Extra features

### Kanban

`/kanban` renders six columns (Applied → Rejected) populated from the candidates
API. The per-card stage dropdown moves a candidate optimistically and rolls back
on API failure. No drag library is used.

### Interview scheduling

`/interviews` shows a CSS-grid month calendar plus a 14-day agenda. Create,
edit, and delete interviews from the modal (`components/InterviewModal.jsx`),
or schedule one directly from a candidate's detail page.

Backend: `GET/POST/PATCH/DELETE /api/interviews` (scoped by recruiter).

### Analytics dashboard

`/analytics` aggregates `Candidate` + `Job` data into four Recharts panels:
pipeline by stage, source conversion, avg days per stage, and top jobs.

Backend: `GET /api/analytics/overview?from=&to=` returns
`{ totals, pipeline, timeInStage, sourceConversion, avgDaysToHire, topJobs, range }`.
