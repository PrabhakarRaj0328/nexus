import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.icon}>⬡</span>
          <h1 className="font-display" style={{fontSize:'28px'}}>Join Nexus</h1>
          <p className="text-muted text-sm">Create your community account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input
              type="text" className="input" placeholder="cooluser123"
              value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value}))}
              required minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+"
            />
            <span className={styles.hint}>Letters, numbers, underscores only</span>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email" className="input" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password" className="input" placeholder="Min 6 characters"
              value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
              required minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'12px'}} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login" style={{color:'var(--accent2)'}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
