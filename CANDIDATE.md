# Smart Task Tracker - Submission

## Implementation Summary

✅ **All core requirements completed:**

1. **Projects & Tasks API** - All FastAPI routes implemented
2. **Smart Intake** - Deterministic fake AI that extracts priority from keywords
3. **UI** - Next.js frontend with task filtering and smart intake
4. **Tests** - 4 tests covering happy path + error scenarios
5. **Documentation** - Complete README + AI Usage Report

## Architecture Decisions

- **In-memory storage**: Faster implementation within 4-hour scope
- **Single-page UI**: Minimal but functional interface
- **Deterministic AI**: Keywords "urgent"/"asap" → High, "later"/"someday" → Low

## Running the Application

### Option 1: Docker (Recommended)
```bash
docker compose up --build
```
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

### Option 2: Manual
```bash
# Backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

## Tests
```bash
pytest test_health.py test_tasks.py -v
```

## Time Spent: ~3.5 hours

## Trade-offs & TODOs
- Used in-memory storage (easy to swap for SQLite)
- Minimal UI styling (focused on functionality)
- No authentication (out of scope)
- No task updates in UI (PATCH endpoint exists)

## AI Usage Report
AI was used to validate API design patterns and generate boilerplate code. All business logic and architecture decisions were implemented manually. No production AI models are used in the application.