# Smart Task Tracker - Frontend

Next.js TypeScript frontend with task management UI.

## Features

- ✅ Project creation and selection
- ✅ Task list with status filtering
- ✅ Task creation form with priority levels
- ✅ Smart AI intake interface
- ✅ Real-time task status updates
- ✅ Responsive design with inline styles

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## UI Components

### Project Management
- Create new projects
- Select active project from dropdown

### Smart Intake
- Paste/type task descriptions
- Get AI suggestions for title and priority
- Auto-fill task creation form

### Task Management
- Filter tasks by status (All, Todo, In-Progress, Done)
- Create tasks with title and priority
- Update task status with click buttons
- Visual priority indicators (color-coded)

## Architecture

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Inline styles for simplicity
- **State**: React hooks (useState, useEffect)
- **API**: Fetch calls to FastAPI backend
- **Environment**: Configurable API base URL