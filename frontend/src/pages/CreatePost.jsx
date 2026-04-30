import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import styles from './CreatePost.module.css';

const CATEGORIES = ['general', 'tech', 'science', 'art', 'gaming', 'meta'];

export default function CreatePost() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '', category: 'general' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const post = await api.post('/posts', form, token);
      navigate(`/post/${post.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <h1 className="font-display" style={{fontSize:'32px'}}>Create a Post</h1>
        <p className="text-muted text-sm">Share your thoughts with the community</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label className={styles.label}>Category</label>
          <div className={styles.cats}>
            {CATEGORIES.map(cat => (
              <button
                key={cat} type="button"
                className={`${styles.catBtn} ${form.category === cat ? styles.active : ''}`}
                onClick={() => setForm(f => ({...f, category: cat}))}
              >{cat}</button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Title</label>
          <input
            type="text" className="input" placeholder="An interesting title…"
            value={form.title} maxLength={300}
            onChange={e => setForm(f => ({...f, title: e.target.value}))}
            required style={{fontSize:'16px',padding:'14px 16px'}}
          />
          <span style={{fontSize:'12px',color:'var(--text3)',textAlign:'right'}}>{form.title.length}/300</span>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Content</label>
          <textarea
            className="input" placeholder="Share your thoughts, ask a question, start a discussion…"
            value={form.content} rows={10}
            onChange={e => setForm(f => ({...f, content: e.target.value}))}
            required style={{resize:'vertical',lineHeight:'1.7'}}
          />
        </div>

        <div className={styles.actions}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" style={{padding:'12px 32px'}} disabled={loading}>
            {loading ? 'Publishing…' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
