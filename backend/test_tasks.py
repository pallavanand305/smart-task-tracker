from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_project_and_task():
    # Create project
    p = client.post("/api/projects", json={"name": "Demo"})
    assert p.status_code == 200
    project_id = p.json()["id"]

    # Create task
    t = client.post(
        f"/api/projects/{project_id}/tasks",
        json={"title": "Test Task"}
    )
    assert t.status_code == 200
    assert t.json()["status"] == "Todo"

def test_task_not_found():
    r = client.patch("/api/tasks/999", json={"status": "Done"})
    assert r.status_code == 404

def test_ai_intake():
    r = client.post("/api/ai/intake", json={"input": "urgent fix the bug"})
    assert r.status_code == 200
    data = r.json()
    assert data["priority"] == "High"
    assert "urgent fix the bug" in data["title"]