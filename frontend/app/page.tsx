'use client';

import { useState, useEffect } from 'react';

type Status = 'Todo' | 'In-Progress' | 'Done';
type Priority = 'Low' | 'Med' | 'High';

interface Project {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  project_id: number;
}

interface AIResponse {
  title: string;
  priority: Priority;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export default function Page() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
  const [newProject, setNewProject] = useState('');
  const [taskForm, setTaskForm] = useState({ title: '', priority: 'Low' as Priority });
  const [smartIntake, setSmartIntake] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<AIResponse | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/projects`);
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchTasks = async (projectId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/projects/${projectId}/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const createProject = async () => {
    if (!newProject.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProject })
      });
      const project = await res.json();
      setProjects([...projects, project]);
      setNewProject('');
      setSelectedProject(project.id);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const createTask = async () => {
    if (!taskForm.title.trim() || !selectedProject) return;
    try {
      const res = await fetch(`${API_BASE}/api/projects/${selectedProject}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm)
      });
      const task = await res.json();
      setTasks([...tasks, task]);
      setTaskForm({ title: '', priority: 'Low' });
      setAiSuggestion(null);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const updateTaskStatus = async (taskId: number, status: Status) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const res = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status })
      });
      const updatedTask = await res.json();
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleSmartIntake = async () => {
    if (!smartIntake.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/ai/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: smartIntake })
      });
      const suggestion = await res.json();
      setAiSuggestion(suggestion);
      setTaskForm({ title: suggestion.title, priority: suggestion.priority });
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
    }
  };

  const filteredTasks = statusFilter === 'All' 
    ? tasks 
    : tasks.filter(task => task.status === statusFilter);

  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 800, margin: '0 auto' }}>
      {/* Project Selection */}
      <div style={{ display: 'grid', gap: 12 }}>
        <h2>Projects</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="New project name"
            value={newProject}
            onChange={(e) => setNewProject(e.target.value)}
            style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
          />
          <button onClick={createProject} style={{ padding: 8, backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}>Create</button>
        </div>
        <select 
          value={selectedProject || ''} 
          onChange={(e) => setSelectedProject(Number(e.target.value))}
          style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
        >
          <option value="">Select a project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>

      {selectedProject && (
        <>
          {/* Smart Intake */}
          <div style={{ display: 'grid', gap: 12, padding: 16, border: '1px solid #e0e0e0', borderRadius: 8 }}>
            <h3>Smart Intake</h3>
            <textarea
              placeholder="Paste or type task description here..."
              value={smartIntake}
              onChange={(e) => setSmartIntake(e.target.value)}
              style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4, minHeight: 80 }}
            />
            <button onClick={handleSmartIntake} style={{ padding: 8, backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 4 }}>Get AI Suggestion</button>
            {aiSuggestion && (
              <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 4 }}>
                <strong>AI Suggestion:</strong> {aiSuggestion.title} (Priority: {aiSuggestion.priority})
              </div>
            )}
          </div>

          {/* Task Form */}
          <div style={{ display: 'grid', gap: 12, padding: 16, border: '1px solid #e0e0e0', borderRadius: 8 }}>
            <h3>Create Task</h3>
            <input
              type="text"
              placeholder="Task title"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
            />
            <select
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as Priority })}
              style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
            >
              <option value="Low">Low Priority</option>
              <option value="Med">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
            <button onClick={createTask} style={{ padding: 8, backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}>Create Task</button>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <strong>Filter by status:</strong>
            {['All', 'Todo', 'In-Progress', 'Done'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as Status | 'All')}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  backgroundColor: statusFilter === status ? '#007bff' : 'white',
                  color: statusFilter === status ? 'white' : 'black'
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Task List */}
          <div style={{ display: 'grid', gap: 12 }}>
            <h3>Tasks ({filteredTasks.length})</h3>
            {filteredTasks.length === 0 ? (
              <p style={{ color: '#666' }}>No tasks found.</p>
            ) : (
              filteredTasks.map(task => (
                <div key={task.id} style={{ padding: 16, border: '1px solid #e0e0e0', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h4 style={{ margin: 0 }}>{task.title}</h4>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: 12, 
                      fontSize: 12, 
                      backgroundColor: task.priority === 'High' ? '#dc3545' : task.priority === 'Med' ? '#ffc107' : '#28a745',
                      color: 'white'
                    }}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && <p style={{ margin: '8px 0', color: '#666' }}>{task.description}</p>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['Todo', 'In-Progress', 'Done'].map(status => (
                      <button
                        key={status}
                        onClick={() => updateTaskStatus(task.id, status as Status)}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #ccc',
                          borderRadius: 4,
                          backgroundColor: task.status === status ? '#007bff' : 'white',
                          color: task.status === status ? 'white' : 'black',
                          fontSize: 12
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}