import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus, BarChart3, UserPlus, Clock, AlertTriangle,
  ChevronDown, Trash2, GripVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';

const STATUS_COLUMNS = [
  { key: 'TODO', label: 'To Do', color: '#8b949e', icon: '📋' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: '#58a6ff', icon: '🔵' },
  { key: 'IN_REVIEW', label: 'In Review', color: '#d29922', icon: '🟡' },
  { key: 'DONE', label: 'Done', color: '#3fb950', icon: '✅' },
];

const PRIORITY_COLORS = {
  LOW: '#8b949e',
  MEDIUM: '#58a6ff',
  HIGH: '#f0883e',
  URGENT: '#f85149',
};

export default function ProjectBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'MEDIUM', assigneeId: '', deadline: ''
  });
  const [memberEmail, setMemberEmail] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchMembers();
  }, [id]);

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/projects/${id}/tasks`);
      setTasks(res.data);
    } catch (err) {
      toast.error('Failed to load tasks');
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await API.get(`/projects/${id}/members`);
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/projects/${id}/tasks`, {
        ...newTask,
        assigneeId: newTask.assigneeId || null,
        deadline: newTask.deadline || null,
      });
      toast.success('Task created!');
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', assigneeId: '', deadline: '' });
      fetchTasks();
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await API.patch(`/projects/${id}/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await API.delete(`/projects/${id}/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const searchRes = await API.get(`/users/search?email=${memberEmail}`);
      if (searchRes.data.error) {
        toast.error('User not found. They must register first.');
        return;
      }
      await API.post(`/projects/${id}/members`, { userId: searchRes.data.id });
      toast.success(`${searchRes.data.name} added!`);
      setShowMemberModal(false);
      setMemberEmail('');
      fetchMembers();
    } catch (err) {
      toast.error('Failed to add member');
    }
  };

  const isOverdue = (task) => {
    return task.deadline && new Date(task.deadline) < new Date() && task.status !== 'DONE';
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDrop = (status) => {
    if (draggedTask && draggedTask.status !== status) {
      handleStatusChange(draggedTask.id, status);
    }
    setDraggedTask(null);
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Project Board</h1>
        <div style={styles.actions}>
          <button className="btn-ghost" onClick={() => navigate(`/project/${id}/dashboard`)}
            style={styles.actionBtn}>
            <BarChart3 size={16} /> Dashboard
          </button>
          <button className="btn-ghost" onClick={() => setShowMemberModal(true)}
            style={styles.actionBtn}>
            <UserPlus size={16} /> Add Member
          </button>
          <button className="btn-primary" onClick={() => setShowTaskModal(true)}
            style={styles.actionBtn}>
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      <div style={styles.board}>
        {STATUS_COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              style={styles.column}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.key)}
            >
              <div style={styles.colHeader}>
                <span>{col.icon} {col.label}</span>
                <span style={{
                  ...styles.badge,
                  background: col.color + '22',
                  color: col.color
                }}>
                  {columnTasks.length}
                </span>
              </div>

              <div style={styles.taskList}>
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    style={styles.taskCard}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#58a6ff'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2d333b'}
                  >
                    <div style={styles.taskTop}>
                      <GripVertical size={14} color="#2d333b" />
                      <span style={{
                        ...styles.priorityBadge,
                        background: PRIORITY_COLORS[task.priority] + '22',
                        color: PRIORITY_COLORS[task.priority],
                      }}>
                        {task.priority}
                      </span>
                    </div>
                    <h4 style={styles.taskTitle}>{task.title}</h4>
                    {task.description && (
                      <p style={styles.taskDesc}>{task.description}</p>
                    )}
                    <div style={styles.taskFooter}>
                      {task.deadline && (
                        <span style={{
                          ...styles.deadline,
                          color: isOverdue(task) ? '#f85149' : '#8b949e',
                        }}>
                          {isOverdue(task) && <AlertTriangle size={12} />}
                          <Clock size={12} />
                          {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                      {task.assignee && (
                        <span style={styles.assignee}>
                          {task.assignee.name?.charAt(0)}
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        style={styles.deleteBtn}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div style={styles.overlay} onClick={() => setShowTaskModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Create Task</h2>
            <form onSubmit={handleCreateTask} style={styles.form}>
              <input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows={3}
                style={{ resize: 'vertical' }}
              />
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent</option>
              </select>
              <select
                value={newTask.assigneeId}
                onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user?.id || m.id} value={m.user?.id || m.id}>
                    {m.user?.name || 'Member'}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              />
              <div style={styles.modalActions}>
                <button type="button" className="btn-ghost" onClick={() => setShowTaskModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div style={styles.overlay} onClick={() => setShowMemberModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add Team Member</h2>
            <form onSubmit={handleAddMember} style={styles.form}>
              <input
                placeholder="Member's email address"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                required
            />
            <p style={{ fontSize: '12px', color: '#8b949e' }}>
                The user must have an account on TaskFlow first
            </p>
              <div style={styles.modalActions}>
                <button type="button" className="btn-ghost" onClick={() => setShowMemberModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    minHeight: '70vh',
  },
  column: {
    background: '#161b22',
    borderRadius: '12px',
    padding: '12px',
    border: '1px solid #2d333b',
  },
  colHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 4px',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
  },
  badge: {
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minHeight: '200px',
  },
  taskCard: {
    background: '#1c2129',
    border: '1px solid #2d333b',
    borderRadius: '10px',
    padding: '14px',
    cursor: 'grab',
    transition: 'border-color 0.2s',
  },
  taskTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  priorityBadge: {
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '4px',
  },
  taskDesc: {
    fontSize: '12px',
    color: '#8b949e',
    marginBottom: '10px',
  },
  taskFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
  },
  deadline: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
  },
  assignee: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#58a6ff22',
    color: '#58a6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '600',
    marginLeft: 'auto',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#f85149',
    cursor: 'pointer',
    padding: '4px',
    opacity: 0.6,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  modal: {
    background: '#1c2129',
    border: '1px solid #2d333b',
    borderRadius: '16px',
    padding: '28px',
    width: '100%',
    maxWidth: '440px',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '8px',
  },
};