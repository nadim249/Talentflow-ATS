# TalentFlow ATS

A clean, beginner-friendly MERN Applicant Tracking System.

## Features

- JWT auth with recruiter role
- Jobs CRUD with search/filter and status toggle
- Candidates CRUD with PDF resume upload (Cloudinary)
- Search/filter by name, email, skill, and stage
- Candidate detail view with notes and resume link
- **Drag-free Kanban board** for moving candidates across stages
- **Interview scheduling** with calendar + agenda view (`/interviews`)
- **Analytics dashboard** with pipeline, time-in-stage, source conversion, and top jobs (`/analytics`)
- Tailwind UI, react-hot-toast notifications, Lucide icons

## Quick start

```bash
# Backend
cd talentflow/backend
cp .env.example .env
npm install
npm run dev         # http://localhost:5000

```bash
#frontend
cd talentflow/frontend
cp .env.example .env       # set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                # http://localhost:5173

