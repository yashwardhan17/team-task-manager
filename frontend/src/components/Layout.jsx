import { Outlet, useNavigate } from 'react-router-dom';
import { Zap, LogOut, FolderOpen } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'User';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.nav}>
        <div style={styles.navLeft} onClick={() => navigate('/')}>
          <Zap size={22} color="#58a6ff" />
          <span style={styles.brand}>TaskFlow</span>
        </div>
        <div style={styles.navRight}>
          <button className="btn-ghost" onClick={() => navigate('/')} style={styles.navBtn}>
            <FolderOpen size={16} /> Projects
          </button>
          <span style={styles.userName}>{userName}</span>
          <button className="btn-ghost" onClick={handleLogout} style={styles.navBtn}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px',
    background: '#161b22',
    borderBottom: '1px solid #2d333b',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  brand: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#e1e4e8',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    fontSize: '13px',
  },
  userName: {
    color: '#8b949e',
    fontSize: '13px',
  },
  main: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
};