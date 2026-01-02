from typing import Optional
from pydantic import BaseModel
from enum import Enum

class Status(str, Enum):
    TODO = "Todo"
    IN_PROGRESS = "In-Progress"
    DONE = "Done"

class Priority(str, Enum):
    LOW = "Low"
    MED = "Med"
    HIGH = "High"

class ProjectCreate(BaseModel):
    name: str

class ProjectRead(BaseModel):
    id: int
    name: str

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    status: Status = Status.TODO
    priority: Priority = Priority.MED

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Status] = None
    priority: Optional[Priority] = None

class TaskRead(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: Status
    priority: Priority
    project_id: int

class AIIntakeRequest(BaseModel):
    input: str

class AIIntakeResponse(BaseModel):
    title: str
    priority: Priority