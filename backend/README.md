# Smart Task Tracker - Backend

FastAPI backend with REST API endpoints for task management.

## Features

- ✅ Project and task management APIs
- ✅ Status filtering for tasks
- ✅ Smart AI intake endpoint
- ✅ CORS middleware for frontend integration
- ✅ In-memory data storage
- ✅ Comprehensive test coverage

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /healthz` - Health check
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}/tasks` - List tasks (with optional status filter)
- `POST /api/projects/{id}/tasks` - Create new task
- `PATCH /api/tasks/{id}` - Update task status
- `POST /api/ai/intake` - Smart task intake with AI suggestions

## Testing

```bash
pytest test_health.py test_tasks.py
```

## Architecture

- **Framework**: FastAPI with Pydantic models
- **Storage**: In-memory lists (projects, tasks)
- **AI**: Deterministic fake AI for demo purposes
- **CORS**: Configured for localhost:3000 frontend