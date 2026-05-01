import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, Clock, AlertTriangle,
  BarChart3, Activity, ListTodo
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';

export default function Dashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [id]);

  const fetchDashboard = async () => {
    try {
      const res = await API.get(`/projects/${id}/dashboard`);
      setDashboard(res.data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={{ color: '#8b949e', textAlign: 'center', padding: '40px' }}>Loading...</p>;
  if (!dashboard) return null;

  const completionRate = dashboard.totalTasks > 0
    ? Math.round((dashboard.doneCount / dashboard.totalTasks) * 100)
    : 0;

  const stats = [
    { label: 'Total Tasks', value: dashboard.totalTasks, icon: <ListTodo size={20} />, color: '#58a6ff' },
    { label: 'Completed', value: dashboard.doneCount, icon: <CheckCircle size={20} />, color: '#3fb950' },
    { label: 'In Progress', value: dashboard.inProgressCount, icon: <Activity size={20} />, color: '#d29922' },
    { label: 'Overdue', value: dashboard.overdueCount, icon: <AlertTriangle size={20} />, color: '#f85149' },
  ];

  const statusData = [
    { label: 'To Do', count: dashboard.todoCount, color: '#8b949e' },
    { label: 'In Progress', count: dashboard.inProgressCount, color: '#58a6ff' },
    { label: 'In Review', count: dashboard.inReviewCount, color: '#d29922' },
    { label: 'Done', count: dashboard.doneCount, color: '#3fb950' },
  ];

  return (
    <div>
      <div style={styles.header}>
        <button className="btn-ghost" onClick={() => navigate(`/project/${id}`)}
          style={styles.backBtn}>
          <ArrowLeft size={16} /> Back to Board
        </button>
        <h1 style={styles.title}><BarChart3 size={24} /> Project Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: stat.color + '18', color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <p style={styles.statValue}>{stat.value}</p>
              <p style={styles.statLabel}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div style={styles.progressSection}>
        <div style={styles.progressHeader}>
          <h3 style={styles.sectionTitle}>Completion Rate</h3>
          <span style={styles.percentage}>{completionRate}%</span>
        </div>
        <div style={styles.progressBar}>
          <div style={{
            ...styles.progressFill,
            width: `${completionRate}%`,
            background: completionRate === 100 ? '#3fb950' :
              completionRate > 50 ? '#58a6ff' : '#d29922',
          }} />
        </div>
      </div>

      {/* Status Breakdown */}
      <div style={styles.breakdownSection}>
        <h3 style={styles.sectionTitle}>Status Breakdown</h3>
        <div style={styles.breakdownGrid}>
          {statusData.map((s) => (
            <div key={s.label} style={styles.breakdownCard}>
              <div style={{
                ...styles.breakdownDot,
                background: s.color,
              }} />
              <div style={styles.breakdownInfo}>
                <span style={styles.breakdownLabel}>{s.label}</span>
                <span style={styles.breakdownCount}>{s.count}</span>
              </div>
              {dashboard.totalTasks > 0 && (
                <div style={styles.miniBar}>
                  <div style={{
                    height: '100%',
                    width: `${(s.count / dashboard.totalTasks) * 100}%`,
                    background: s.color,
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      {dashboard.recentActivity && dashboard.recentActivity.length > 0 && (
        <div style={styles.activitySection}>
          <h3 style={styles.sectionTitle}>Recent Activity</h3>
          <div style={styles.activityList}>
            {dashboard.recentActivity.slice(0, 10).map((log, i) => (
              <div key={i} style={styles.activityItem}>
                <div style={styles.activityDot} />
                <div>
                  <p style={styles.activityText}>
                    <strong>{log.user?.name || 'Someone'}</strong> {log.action}
                  </p>
                  <p style={styles.activityTime}>
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    marginBottom: '28px',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '12px',
    fontSize: '13px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: '#1c2129',
    border: '1px solid #2d333b',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  statIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#e1e4e8',
  },
  statLabel: {
    fontSize: '13px',
    color: '#8b949e',
  },
  progressSection: {
    background: '#1c2129',
    border: '1px solid #2d333b',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
  },
  percentage: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#58a6ff',
  },
  progressBar: {
    height: '10px',
    background: '#252b35',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '5px',
    transition: 'width 0.8s ease',
  },
  breakdownSection: {
    background: '#1c2129',
    border: '1px solid #2d333b',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
  },
  breakdownGrid: {
    marginTop: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  breakdownCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  breakdownDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  breakdownInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '140px',
    flexShrink: 0,
  },
  breakdownLabel: {
    fontSize: '13px',
    color: '#8b949e',
  },
  breakdownCount: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#e1e4e8',
  },
  miniBar: {
    flex: 1,
    height: '6px',
    background: '#252b35',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  activitySection: {
    background: '#1c2129',
    border: '1px solid #2d333b',
    borderRadius: '12px',
    padding: '20px',
  },
  activityList: {
    marginTop: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  activityItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  activityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#58a6ff',
    marginTop: '6px',
    flexShrink: 0,
  },
  activityText: {
    fontSize: '13px',
    color: '#e1e4e8',
  },
  activityTime: {
    fontSize: '11px',
    color: '#8b949e',
    marginTop: '2px',
  },
};