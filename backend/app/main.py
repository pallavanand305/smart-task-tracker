from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- HEALTH CHECK ----------------
@app.get("/healthz")
def health_check():
    return {"ok": True}

# ---------------- ENUMS ----------------
class Status(str, Enum):
    todo = "Todo"
    in_progress = "In-Progress"
    done = "Done"

class Priority(str, Enum):
    low = "Low"
    med = "Med"
    high = "High"

# ---------------- MODELS ----------------
class ProjectCreate(BaseModel):
    name: str

class Project(ProjectCreate):
    id: int

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: Status = Status.todo
    priority: Priority = Priority.low

class Task(TaskCreate):
    id: int
    project_id: int

class AIIntake(BaseModel):
    input: str

class AIResponse(BaseModel):
    title: str
    priority: Priority

# ---------------- IN-MEMORY DB ----------------
projects = []
tasks = []

project_id_seq = 1
task_id_seq = 1

# ---------------- PROJECT APIs ----------------
@app.get("/api/projects", response_model=List[Project])
def list_projects():
    return projects


@app.post("/api/projects", response_model=Project)
def create_project(payload: ProjectCreate):
    global project_id_seq
    project = {"id": project_id_seq, "name": payload.name}
    projects.append(project)
    project_id_seq += 1
    return project

# ---------------- TASK APIs ----------------
@app.get("/api/projects/{project_id}/tasks", response_model=List[Task])
def list_tasks(project_id: int, status: Optional[Status] = None):
    result = [t for t in tasks if t["project_id"] == project_id]
    if status:
        result = [t for t in result if t["status"] == status]
    return result


@app.post("/api/projects/{project_id}/tasks", response_model=Task)
def create_task(project_id: int, payload: TaskCreate):
    global task_id_seq

    if not any(p["id"] == project_id for p in projects):
        raise HTTPException(status_code=404, detail="Project not found")

    task = {
        "id": task_id_seq,
        "project_id": project_id,
        **payload.dict()
    }
    tasks.append(task)
    task_id_seq += 1
    return task


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Status] = None
    priority: Optional[Priority] = None

@app.patch("/api/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, payload: TaskUpdate):
    for task in tasks:
        if task["id"] == task_id:
            update_data = payload.dict(exclude_unset=True)
            task.update(update_data)
            return task
    raise HTTPException(status_code=404, detail="Task not found")

# ---------------- AI INTAKE ----------------
@app.post("/api/ai/intake", response_model=AIResponse)
def ai_intake(payload: AIIntake):
    text = payload.input.lower()

    priority = Priority.high if "urgent" in text else Priority.low
    title = payload.input.split(".")[0][:50]

    return {"title": title, "priority": priority}