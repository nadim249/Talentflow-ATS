# TalentFlow ATS

TalentFlow ATS is a beginner-friendly applicant tracking system built on the MERN stack. It helps recruiters manage job postings, candidates, resumes, interviews, and the overall hiring pipeline in one place.

## Features

- JWT-based authentication with a recruiter role
- Full CRUD for job postings, with search, filtering, and status toggling
- Full CRUD for candidates, including PDF resume uploads via Cloudinary
- Search and filter candidates by name, email, skill, or pipeline stage
- Candidate detail view with notes and a link to their resume
- Kanban board for moving candidates through stages (click-based, no drag-and-drop required)
- Interview scheduling with both calendar and agenda views (`/interviews`)
- Analytics dashboard covering pipeline health, time spent per stage, source conversion, and top-performing jobs (`/analytics`)
- Clean UI built with Tailwind CSS, toast notifications via react-hot-toast, and Lucide icons

## Quick Start

### Backend

```bash
cd talentflow/backend
cp .env.example .env
npm install
npm run dev         # runs on http://localhost:5000
```

### Frontend

```bash
cd talentflow/frontend
cp .env.example .env       # set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                # runs on http://localhost:5173
```
