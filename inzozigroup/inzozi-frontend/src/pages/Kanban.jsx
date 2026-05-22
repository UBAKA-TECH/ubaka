import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Plus, 
  Trash2, 
  User, 
  AlertCircle, 
  Calendar,
  Grid,
  CheckSquare
} from 'lucide-react';

const Kanban = () => {
  const { token, user } = useAuth();
  const socket = useSocket();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);
  
  // New Task Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newProjId, setNewProjId] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState('');

  const columns = [
    { id: 'todo', label: 'To Do', color: 'border-t-slate-700 bg-slate-900/40' },
    { id: 'in_progress', label: 'In Progress', color: 'border-t-blue-500 bg-blue-950/5' },
    { id: 'review', label: 'In Review', color: 'border-t-purple-500 bg-purple-950/5' },
    { id: 'done', label: 'Completed', color: 'border-t-emerald-500 bg-emerald-950/5' }
  ];

  const fetchTasks = async () => {
    try {
      const url = selectedProjectId 
        ? `${API_BASE_URL}/tasks?projectId=${selectedProjectId}`
        : `${API_BASE_URL}/tasks`;
        
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      // Fetch projects for filters and dropdowns
      try {
        const projRes = await fetch(`${API_BASE_URL}/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (projRes.ok) {
          const projData = await projRes.json();
          setProjects(projData);
          if (projData.length > 0) {
            setNewProjId(projData[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading projects:', err);
      }

      await fetchTasks();
      setLoading(false);
    };

    fetchInitialData();
  }, [token, selectedProjectId]);

  // WebSocket Live Synchronization
  useEffect(() => {
    if (!socket) return;

    // Join room for real-time task board tracking
    socket.emit('join_channel', 'tasks_global');

    socket.on('task_updated', (data) => {
      console.log('[WebSocket] Live task update received:', data);
      // Refetch tasks to sync the board
      fetchTasks();
    });

    return () => {
      socket.off('task_updated');
    };
  }, [socket, selectedProjectId]);

  // Drag and Drop implementation
  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = async (e, columnId) => {
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Instantly update UI locally (Optimistic update)
    const taskToMove = tasks.find(t => t.id === taskId);
    if (!taskToMove || taskToMove.status === columnId) return;

    const originalTasks = [...tasks];
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: columnId } : t));

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: columnId })
      });

      if (!response.ok) {
        // Rollback
        setTasks(originalTasks);
      } else {
        // Emit socket notification to alert others
        if (socket) {
          socket.emit('task_moved', { taskId, status: columnId, projectId: 'tasks_global' });
        }
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      setTasks(originalTasks);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          priority: newPriority,
          projectId: newProjId,
          assigneeId: newAssigneeId || undefined
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        setNewTitle('');
        setNewDescription('');
        await fetchTasks();
        
        // Notify others
        if (socket) {
          socket.emit('task_moved', { projectId: 'tasks_global' });
        }
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchTasks();
        if (socket) {
          socket.emit('task_moved', { projectId: 'tasks_global' });
        }
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/15 text-red-400 border border-red-500/25';
      case 'high':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/25';
      case 'medium':
        return 'bg-blue-500/15 text-blue-400 border border-blue-500/25';
      case 'low':
        return 'bg-slate-800 text-slate-400 border border-slate-700';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  return (
    <div className="space-y-6 p-8 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col justify-between overflow-hidden">
      
      {/* Kanban Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-purple-400" />
            Product Backlog & Kanban
          </h1>
          <p className="text-slate-400 text-xs">Drag and drop cards to update progress in real-time</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Project Filtering Dropdown */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Add Task Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-1.5 px-4 rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-purple-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Columns Grid */}
      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 grid md:grid-cols-4 gap-4 overflow-hidden py-2 min-h-0">
          {columns.map((col) => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div 
                key={col.id}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, col.id)}
                className={`rounded-xl border border-slate-800/80 p-4 flex flex-col min-h-0 overflow-hidden border-t-2 ${col.color}`}
              >
                {/* Column Title */}
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">{col.label}</h3>
                  <span className="text-[10px] bg-slate-950 px-2 py-0.5 border border-slate-800/60 rounded-full text-slate-400 font-bold">
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Body: Task list */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {colTasks.length === 0 ? (
                    <div className="h-28 border border-dashed border-slate-850 rounded-lg flex items-center justify-center text-slate-600 text-xs select-none">
                      Drag tasks here
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, task.id)}
                        className="bg-slate-950 border border-slate-850/80 rounded-xl p-4 space-y-3 cursor-grab active:cursor-grabbing hover:border-slate-700/80 transition-colors shadow-sm select-none group"
                      >
                        {/* Title & Delete */}
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-bold text-slate-100 group-hover:text-white leading-snug transition-colors">
                            {task.title}
                          </h4>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-slate-600 hover:text-red-400 p-0.5 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Badges & Assignee */}
                        <div className="flex justify-between items-center gap-2 pt-1 border-t border-slate-900 shrink-0">
                          <div className="flex gap-1.5">
                            {/* Project tag */}
                            <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-slate-900 border border-slate-850 text-slate-500">
                              {projects.find(p => p.id === task.projectId)?.name || 'Project'}
                            </span>
                            {/* Priority tag */}
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${getPriorityStyle(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>

                          {/* Assignee Avatar */}
                          {task.assignee ? (
                            <img
                              src={task.assignee.avatar}
                              alt={task.assignee.name}
                              title={`Assigned to: ${task.assignee.name}`}
                              className="w-5 h-5 rounded-full bg-slate-900 border border-slate-850"
                            />
                          ) : (
                            <div 
                              title="Unassigned"
                              className="w-5 h-5 rounded-full bg-slate-900 border border-dashed border-slate-800 flex items-center justify-center"
                            >
                              <User className="w-2.5 h-2.5 text-slate-600" />
                            </div>
                          )}
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight">Create Development Task</h3>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Task Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Bugfix stripe currency parsing"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Enter deep-dive details..."
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-purple-500 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Project</label>
                  <select
                    value={newProjId}
                    onChange={(e) => setNewProjId(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    required
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Assignee</label>
                <select
                  value={newAssigneeId}
                  onChange={(e) => setNewAssigneeId(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="">Unassigned</option>
                  <option value="mock-dev-id">Benit Gilbert (Developer)</option>
                  <option value="mock-marketer-id">Growth Marketer (Marketing)</option>
                  <option value="mock-admin-id">Inzozi Admin (Admin)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-slate-400 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-lg cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Kanban;
