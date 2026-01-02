import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from . import schemas

app = FastAPI(title="Smart Task Tracker API", version="1.0.0")

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
def healthz():
    return {"ok": True}

# In-memory storage
projects = {}
tasks = {}
project_id_seq = 1
task_id_seq = 1

@app.get("/api/projects", response_model=List[schemas.ProjectRead])
def list_projects():
    return list(projects.values())

@app.post("/api/projects", response_model=schemas.ProjectRead)
def create_project(body: schemas.ProjectCreate):
    global project_id_seq
    project = {"id": project_id_seq, "name": body.name}
    projects[project_id_seq] = project
    project_id_seq += 1
    return project

@app.get("/api/projects/{project_id}/tasks", response_model=List[schemas.TaskRead])
def list_tasks(project_id: int, status: Optional[schemas.Status] = Query(None)):
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")

    result = [
        task for task in tasks.values()
        if task["project_id"] == project_id
    ]

    if status:
        result = [t for t in result if t["status"] == status]

    return result

@app.post("/api/projects/{project_id}/tasks", response_model=schemas.TaskRead)
def create_task(project_id: int, body: schemas.TaskCreate):
    global task_id_seq

    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")

    task = {
        "id": task_id_seq,
        "title": body.title,
        "description": body.description,
        "status": body.status,
        "priority": body.priority,
        "project_id": project_id,
    }

    tasks[task_id_seq] = task
    task_id_seq += 1
    return task

@app.patch("/api/tasks/{task_id}", response_model=schemas.TaskRead)
def update_task(task_id: int, body: schemas.TaskUpdate):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")

    task = tasks[task_id]

    for field, value in body.model_dump(exclude_unset=True).items():
        task[field] = value

    return task

@app.post("/api/ai/intake", response_model=schemas.AIIntakeResponse)
def ai_intake(body: schemas.AIIntakeRequest):
    text = body.input.lower()

    if "urgent" in text or "asap" in text:
        priority = "High"
    elif "later" in text or "someday" in text:
        priority = "Low"
    else:
        priority = "Med"

    title = body.input.strip().split(".")[0][:80]

    return {
        "title": title,
        "priority": priority
    }