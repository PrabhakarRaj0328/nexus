import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          <span className="font-display" style={{fontSize:'20px'}}>Nexus</span>
        </Link>

        <div className={styles.actions}>
          {user ? (
            <>
              <Link to="/create" className="btn btn-primary" style={{padding:'8px 16px',fontSize:'13px'}}>
                + New Post
              </Link>
              <Link to={`/u/${user.username}`} className={styles.avatar}>
                {user.avatar_url
                  ? <img src={user.avatar_url} alt={user.username} />
                  : <span>{user.username[0].toUpperCase()}</span>
                }
              </Link>
              <button className="btn btn-ghost" style={{padding:'8px 14px',fontSize:'13px'}} onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" style={{padding:'8px 16px',fontSize:'13px'}}>Sign in</Link>
              <Link to="/register" className="btn btn-primary" style={{padding:'8px 16px',fontSize:'13px'}}>Join</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
