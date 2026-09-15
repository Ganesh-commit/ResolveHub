# ResolveHub — Full-Stack Architecture

## What exists (Frontend only):
- React + TypeScript + Vite + Tailwind
- In-memory data (GrievanceContext) — no persistence
- Complaint submission, citizen view, admin view, FAQ

## What we're building:
- **Backend**: Node.js + Express (REST API)
- **Database**: SQLite (via `better-sqlite3`) — zero setup, file-based
- **Connection**: Frontend → API calls → Backend → Database

## Folder structure after:
```
complaint11/
├── src/          (React frontend - existing)
├── server/       (NEW - Express backend)
│   ├── index.js
│   ├── db.js
│   └── routes/
│       ├── tickets.js
│       └── auth.js
├── data/         (NEW - SQLite DB file auto-created)
└── package.json  (frontend)
└── server/package.json (backend)
```
