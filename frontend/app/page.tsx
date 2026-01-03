"use client";

import { useEffect, useState } from "react";

type Priority = "Low" | "Med" | "High";
type Status = "Todo" | "In-Progress" | "Done";

type Project = {
  id: number;
  name: string;
};

type Task = {
  id: number;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  project_id: number;
};

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function Page() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("Med");
  const [intakeText, setIntakeText] = useState("");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks();
    }
  }, [selectedProject, statusFilter]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string) => {
    setNotification(message);
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/projects`);
      const data = await res.json();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      showNotification("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    try {
      const q = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`${API}/api/projects/${selectedProject}/tasks${q}`);
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      showNotification("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName }),
      });
      const project = await res.json();
      setProjects([...projects, project]);
      setSelectedProject(project.id);
      setNewProjectName("");
      setShowCreateProject(false);
      showNotification("Project created successfully!");
    } catch (error) {
      showNotification("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!selectedProject || !title.trim()) return;

    setLoading(true);
    try {
      await fetch(`${API}/api/projects/${selectedProject}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, priority }),
      });

      setTitle("");
      setDescription("");
      setPriority("Med");
      setIntakeText("");
      setShowCreateTask(false);
      fetchTasks();
      showNotification("Task created successfully!");
    } catch (error) {
      showNotification("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const smartIntake = async () => {
    if (!intakeText.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/ai/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: intakeText }),
      });
      const data = await res.json();
      setTitle(data.title);
      setPriority(data.priority);
      showNotification("AI suggestions applied!");
    } catch (error) {
      showNotification("Failed to process AI intake");
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: Status) => {
    try {
      await fetch(`${API}/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
      showNotification("Task status updated!");
    } catch (error) {
      showNotification("Failed to update task");
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    try {
      // Note: This would need a DELETE endpoint in the backend
      showNotification("Delete functionality coming soon!");
    } catch (error) {
      showNotification("Failed to delete task");
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === "Todo").length,
    inProgress: tasks.filter(t => t.status === "In-Progress").length,
    done: tasks.filter(t => t.status === "Done").length,
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "High": return darkMode ? "#ff6b6b" : "#e74c3c";
      case "Med": return darkMode ? "#feca57" : "#f39c12";
      case "Low": return darkMode ? "#48dbfb" : "#3498db";
      default: return "#95a5a6";
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "Todo": return darkMode ? "#95a5a6" : "#7f8c8d";
      case "In-Progress": return darkMode ? "#3742fa" : "#2980b9";
      case "Done": return darkMode ? "#2ed573" : "#27ae60";
      default: return "#95a5a6";
    }
  };

  const theme = {
    bg: darkMode ? "#1a1a1a" : "#f8f9fa",
    cardBg: darkMode ? "#2d2d2d" : "#ffffff",
    text: darkMode ? "#ffffff" : "#2c3e50",
    textSecondary: darkMode ? "#b0b0b0" : "#7f8c8d",
    border: darkMode ? "#404040" : "#e1e8ed",
    shadow: darkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.1)",
  };

  return (
    <div style={{ 
      padding: 20, 
      fontFamily: "system-ui", 
      backgroundColor: theme.bg, 
      minHeight: "100vh",
      color: theme.text,
      transition: "all 0.3s ease"
    }}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: "fixed",
          top: 20,
          right: 20,
          backgroundColor: "#2ed573",
          color: "white",
          padding: "12px 20px",
          borderRadius: 8,
          boxShadow: theme.shadow,
          zIndex: 1001,
          animation: "slideIn 0.3s ease"
        }}>
          {notification}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <div>
          <h1 style={{ margin: 0, color: theme.text, fontSize: 32, fontWeight: "bold" }}>
            🚀 Smart Task Tracker
          </h1>
          <p style={{ margin: "5px 0 0 0", color: theme.textSecondary }}>
            AI-Powered Project Management
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: "8px 12px",
              backgroundColor: "transparent",
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 18
            }}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          <button
            onClick={() => setShowCreateProject(true)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#3742fa",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "600",
              boxShadow: theme.shadow,
              transition: "transform 0.2s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            ➕ New Project
          </button>
          {selectedProject && (
            <button
              onClick={() => setShowCreateTask(true)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#2ed573",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: "600",
                boxShadow: theme.shadow,
                transition: "transform 0.2s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              ✨ New Task
            </button>
          )}
        </div>
      </div>

      {/* Stats Dashboard */}
      {selectedProject && (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: 16, 
          marginBottom: 30 
        }}>
          <div style={{
            backgroundColor: theme.cardBg,
            padding: 20,
            borderRadius: 12,
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`,
            textAlign: "center"
          }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#3742fa" }}>📊 Total Tasks</h3>
            <p style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>{taskStats.total}</p>
          </div>
          <div style={{
            backgroundColor: theme.cardBg,
            padding: 20,
            borderRadius: 12,
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`,
            textAlign: "center"
          }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#95a5a6" }}>📝 Todo</h3>
            <p style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>{taskStats.todo}</p>
          </div>
          <div style={{
            backgroundColor: theme.cardBg,
            padding: 20,
            borderRadius: 12,
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`,
            textAlign: "center"
          }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#3742fa" }}>⚡ In Progress</h3>
            <p style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>{taskStats.inProgress}</p>
          </div>
          <div style={{
            backgroundColor: theme.cardBg,
            padding: 20,
            borderRadius: 12,
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`,
            textAlign: "center"
          }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#2ed573" }}>✅ Completed</h3>
            <p style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>{taskStats.done}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      {projects.length > 0 && (
        <div style={{ 
          display: "flex", 
          gap: 16, 
          marginBottom: 30, 
          flexWrap: "wrap",
          alignItems: "center"
        }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>🏗️ Project:</label>
            <select
              value={selectedProject || ""}
              onChange={(e) => setSelectedProject(Number(e.target.value))}
              style={{
                padding: 12,
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.cardBg,
                color: theme.text,
                minWidth: 200,
                fontSize: 14
              }}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>🔍 Filter Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | "")}
              style={{
                padding: 12,
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.cardBg,
                color: theme.text,
                minWidth: 150,
                fontSize: 14
              }}
            >
              <option value="">All Tasks</option>
              <option value="Todo">📝 Todo</option>
              <option value="In-Progress">⚡ In Progress</option>
              <option value="Done">✅ Done</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>🔎 Search:</label>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: 12,
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.cardBg,
                color: theme.text,
                minWidth: 200,
                fontSize: 14
              }}
            />
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div style={{ textAlign: "center", padding: 20 }}>
          <div style={{
            width: 40,
            height: 40,
            border: `4px solid ${theme.border}`,
            borderTop: "4px solid #3742fa",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto"
          }}></div>
        </div>
      )}

      {/* Tasks Grid */}
      {selectedProject && !loading && (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", 
          gap: 20 
        }}>
          {filteredTasks.map(task => (
            <div
              key={task.id}
              style={{
                backgroundColor: theme.cardBg,
                padding: 20,
                borderRadius: 12,
                boxShadow: theme.shadow,
                border: `1px solid ${theme.border}`,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = darkMode ? "0 8px 25px rgba(0,0,0,0.4)" : "0 8px 25px rgba(0,0,0,0.15)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = theme.shadow;
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <h3 style={{ margin: 0, color: theme.text, fontSize: 18, fontWeight: "600" }}>
                  {task.title}
                </h3>
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#e74c3c",
                    cursor: "pointer",
                    fontSize: 16,
                    padding: 4
                  }}
                  title="Delete task"
                >
                  🗑️
                </button>
              </div>
              
              {task.description && (
                <p style={{ 
                  margin: "0 0 16px 0", 
                  color: theme.textSecondary, 
                  fontSize: 14,
                  lineHeight: 1.5
                }}>
                  {task.description}
                </p>
              )}
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: "600",
                    backgroundColor: getPriorityColor(task.priority),
                    color: "white",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}
                >
                  {task.priority === "Med" ? "Medium" : task.priority} Priority
                </span>
                
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value as Status)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    border: "none",
                    backgroundColor: getStatusColor(task.status),
                    color: "white",
                    fontSize: 12,
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  <option value="Todo">📝 Todo</option>
                  <option value="In-Progress">⚡ In Progress</option>
                  <option value="Done">✅ Done</option>
                </select>
              </div>

              <div style={{ 
                fontSize: 11, 
                color: theme.textSecondary,
                borderTop: `1px solid ${theme.border}`,
                paddingTop: 12,
                display: "flex",
                justifyContent: "space-between"
              }}>
                <span>Task #{task.id}</span>
                <span>Project #{task.project_id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Projects State */}
      {projects.length === 0 && !loading && (
        <div style={{ 
          textAlign: "center", 
          padding: 60,
          backgroundColor: theme.cardBg,
          borderRadius: 16,
          boxShadow: theme.shadow,
          border: `1px solid ${theme.border}`
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🚀</div>
          <h2 style={{ color: theme.text, marginBottom: 16 }}>Welcome to Smart Task Tracker!</h2>
          <p style={{ color: theme.textSecondary, marginBottom: 30, fontSize: 16 }}>
            Create your first project to start managing tasks with AI assistance.
          </p>
          <button
            onClick={() => setShowCreateProject(true)}
            style={{
              padding: "16px 32px",
              backgroundColor: "#3742fa",
              color: "white",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: "600",
              boxShadow: theme.shadow,
              transition: "transform 0.2s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            🎯 Create First Project
          </button>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateProject && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            backgroundColor: theme.cardBg,
            padding: 32,
            borderRadius: 16,
            minWidth: 450,
            maxWidth: 500,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            border: `1px solid ${theme.border}`
          }}>
            <h3 style={{ margin: "0 0 24px 0", color: theme.text, fontSize: 24 }}>🏗️ Create New Project</h3>
            <input
              type="text"
              placeholder="Enter project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              style={{
                width: "100%",
                padding: 16,
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.bg,
                color: theme.text,
                marginBottom: 24,
                fontSize: 16,
                outline: "none"
              }}
              onKeyPress={(e) => e.key === "Enter" && createProject()}
            />
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowCreateProject(false)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "transparent",
                  color: theme.textSecondary,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={!newProjectName.trim() || loading}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#3742fa",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: newProjectName.trim() ? "pointer" : "not-allowed",
                  fontWeight: "600",
                  opacity: newProjectName.trim() ? 1 : 0.6
                }}
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            backgroundColor: theme.cardBg,
            padding: 32,
            borderRadius: 16,
            minWidth: 550,
            maxWidth: 650,
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            border: `1px solid ${theme.border}`
          }}>
            <h3 style={{ margin: "0 0 24px 0", color: theme.text, fontSize: 24 }}>✨ Create New Task</h3>
            
            {/* Smart Intake */}
            <div style={{ 
              marginBottom: 24, 
              padding: 20, 
              backgroundColor: theme.bg, 
              borderRadius: 12,
              border: `1px solid ${theme.border}`
            }}>
              <label style={{ 
                display: "block", 
                marginBottom: 12, 
                fontWeight: "600",
                color: theme.text,
                fontSize: 16
              }}>
                🤖 AI Smart Intake:
              </label>
              <textarea
                placeholder="Describe your task naturally... (e.g., 'Fix the urgent login bug ASAP' or 'Update documentation later this week')"
                value={intakeText}
                onChange={(e) => setIntakeText(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 8,
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.cardBg,
                  color: theme.text,
                  fontSize: 14,
                  resize: "vertical",
                  outline: "none"
                }}
              />
              <button
                onClick={smartIntake}
                disabled={!intakeText.trim() || loading}
                style={{
                  marginTop: 12,
                  padding: "8px 16px",
                  backgroundColor: "#ff6b6b",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: intakeText.trim() ? "pointer" : "not-allowed",
                  fontSize: 14,
                  fontWeight: "600",
                  opacity: intakeText.trim() ? 1 : 0.6
                }}
              >
                {loading ? "Processing..." : "🧠 Generate Suggestions"}
              </button>
            </div>

            <input
              type="text"
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: 16,
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.bg,
                color: theme.text,
                marginBottom: 20,
                fontSize: 16,
                outline: "none"
              }}
            />

            <textarea
              placeholder="Task description (optional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                padding: 16,
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.bg,
                color: theme.text,
                marginBottom: 20,
                fontSize: 14,
                resize: "vertical",
                outline: "none"
              }}
            />

            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: "block", 
                marginBottom: 12, 
                fontWeight: "600",
                color: theme.text
              }}>
                🎯 Priority Level:
              </label>
              <div style={{ display: "flex", gap: 12 }}>
                {(["Low", "Med", "High"] as Priority[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    style={{
                      padding: "12px 20px",
                      borderRadius: 8,
                      border: priority === p ? "2px solid #3742fa" : `1px solid ${theme.border}`,
                      backgroundColor: priority === p ? "#3742fa" : theme.bg,
                      color: priority === p ? "white" : theme.text,
                      cursor: "pointer",
                      fontWeight: "600",
                      flex: 1,
                      textAlign: "center"
                    }}
                  >
                    {p === "Med" ? "Medium" : p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setShowCreateTask(false);
                  setTitle("");
                  setDescription("");
                  setPriority("Med");
                  setIntakeText("");
                }}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "transparent",
                  color: theme.textSecondary,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Cancel
              </button>
              <button
                onClick={createTask}
                disabled={!title.trim() || loading}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#2ed573",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: title.trim() ? "pointer" : "not-allowed",
                  fontWeight: "600",
                  opacity: title.trim() ? 1 : 0.6
                }}
              >
                {loading ? "Creating..." : "🚀 Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}