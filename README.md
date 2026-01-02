# Smart Task Tracker

A minimal task management system with AI-powered task intake.

## Features

- ✅ Create and manage projects
- ✅ Create tasks with priority levels
- ✅ Filter tasks by status
- ✅ Smart AI intake for task creation
- ✅ REST API with FastAPI
- ✅ React frontend with Next.js

## Quick Start

### Backend
```bash
cd Backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker
```bash
docker-compose up
```

## API Endpoints

- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}/tasks` - List tasks (with optional status filter)
- `POST /api/projects/{id}/tasks` - Create task
- `PATCH /api/tasks/{id}` - Update task
- `POST /api/ai/intake` - Smart task intake

## Architecture

- **Backend**: FastAPI with in-memory storage
- **Frontend**: Next.js with client-side state
- **AI**: Deterministic fake AI for demo purposes

## Tests

```bash
pytest test_health.py test_tasks.py
```

## AI Usage Report

AI was used to validate API design patterns and generate boilerplate code. All business logic and architecture decisions were implemented manually. No production AI models are used in the application.