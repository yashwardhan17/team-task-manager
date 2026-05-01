import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Users, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get('/projects');
      setProjects(res.data);
    } catch (err) {
      toast.error('Failed to load projects');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/projects', { name, description });
      toast.success('Project created!');
      setShowModal(false);
      setName('');
      setDescription('');
      fetchProjects();
    } catch (err) {
      toast.error('Failed to create project');
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Your Projects</h1>
          <p style={styles.subtitle}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={styles.createBtn}>
          <Plus size={18} /> New Project
        </button>
      </div>

      <div style={styles.grid}>
        {projects.map((project) => (
          <div
            key={project.id}
            style={styles.card}
            onClick={() => navigate(`/project/${project.id}`)}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#58a6ff'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2d333b'}
          >
            <div style={styles.cardTop}>
              <FolderOpen size={20} color="#58a6ff" />
              <ChevronRight size={16} color="#8b949e" />
            </div>
            <h3 style={styles.cardTitle}>{project.name}</h3>
            <p style={styles.cardDesc}>{project.description || 'No description'}</p>
            <div style={styles.cardFooter}>
              <span style={styles.cardMeta}>
                <Users size={14} /> Team
              </span>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div style={styles.empty}>
          <FolderOpen size={48} color="#2d333b" />
          <p>No projects yet. Create your first one!</p>
        </div>
      )}

      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Create New Project</h2>
            <form onSubmit={handleCreate} style={styles.form}>
              <input
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
              <div style={styles.modalActions}>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Create Project</button>
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
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
  },
  subtitle: {
    color: '#8b949e',
    fontSize: '14px',
    marginTop: '4px',
  },
  createBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  card: {
    background: '#1c2129',
    border: '1px solid #2d333b',
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '6px',
  },
  cardDesc: {
    fontSize: '13px',
    color: '#8b949e',
    marginBottom: '16px',
  },
  cardFooter: {
    display: 'flex',
    gap: '12px',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#8b949e',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#8b949e',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
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