import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
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
          <h1 className="font-display" style={{fontSize:'28px'}}>Welcome back</h1>
          <p className="text-muted text-sm">Sign in to your Nexus account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
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
              type="password" className="input" placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'12px'}} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account? <Link to="/register" style={{color:'var(--accent2)'}}>Join Nexus</Link>
        </p>
      </div>
    </div>
  );
}
