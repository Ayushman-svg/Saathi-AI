# Study Companion

Study Companion is a React app for planning, tracking, and improving study workflows.

## Implemented Features

- Subject management with name, description, and color labels.
- Topic management inside each subject (difficulty, status, notes).
- Task management with title, subject, topic, deadline, priority, and status.
- Task tabs: `All Tasks`, `Pending`, `Completed`, `Overdue`, `Revision`.
- Dynamic search across tasks, subjects, topics, and notes.
- Filtering by subject, priority, status, and deadline.
- Sorting by due date, priority, and subject name.
- Dashboard with:
  - total/completed/pending/revision task stats
  - subject progress chart
  - completion percentage
  - weekly productivity graph
  - revision reminders
- Revision planner with auto-scheduling (3 days after topic completion).
- AI study assistant for summary, question, and flashcard generation.
- Local backup/restore for offline-first persistence.

## Setup

1. Install dependencies:
   - `npm install`
2. Configure AI key:
   - copy `.env.example` to `.env`
   - set `VITE_OPENAI_API_KEY=your_key_here`
3. Start development server:
   - `npm run dev`

## Build

- `npm run build`
