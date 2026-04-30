import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import styles from './PostDetail.module.css';

export default function PostDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/posts/${id}`, token)
      .then(setPost)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleVote = async () => {
    if (!user) return;
    try {
      const data = await api.post(`/posts/${id}/vote`, { vote_type: 'up' }, token);
      setPost(p => ({...p, upvotes: data.upvotes}));
    } catch {}
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const newComment = await api.post(`/posts/${id}/comments`, { content: comment }, token);
      setPost(p => ({...p, comments: [...(p.comments||[]), newComment]}));
      setComment('');
    } catch {}
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`, token);
      navigate('/');
    } catch {}
  };

  const timeAgo = (date) => {
    const d = Math.floor((Date.now() - new Date(date)) / 1000);
    if (d < 60) return `${d}s ago`;
    if (d < 3600) return `${Math.floor(d/60)}m ago`;
    if (d < 86400) return `${Math.floor(d/3600)}h ago`;
    return `${Math.floor(d/86400)}d ago`;
  };

  if (loading) return <div style={{textAlign:'center',padding:'60px',color:'var(--text2)'}}>Loading…</div>;
  if (!post) return null;

  return (
    <div className={`container ${styles.page}`}>
      <button className="btn btn-ghost" style={{marginBottom:'20px',fontSize:'13px'}} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className={styles.post}>
        <div className={styles.voteCol}>
          <button className={`${styles.voteBtn} ${post.user_voted ? styles.voted : ''}`} onClick={handleVote} disabled={!user}>▲</button>
          <span className={styles.votes}>{post.upvotes || 0}</span>
        </div>
        <div className={styles.content}>
          <div className={styles.meta}>
            <span className={`badge cat-${post.category}`}>{post.category}</span>
            <span className="text-muted text-sm">
              by <Link to={`/u/${post.username}`} style={{color:'var(--accent2)',fontWeight:500}}>{post.username}</Link>
              {' · '}{timeAgo(post.created_at)}
            </span>
            {user?.id === post.user_id && (
              <button className="btn btn-danger" style={{marginLeft:'auto',padding:'4px 12px',fontSize:'12px'}} onClick={handleDelete}>
                Delete
              </button>
            )}
          </div>
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.body}>{post.content}</div>
        </div>
      </div>

      <div className={styles.comments}>
        <h2 className={styles.commentsTitle}>{post.comments?.length || 0} Comments</h2>

        {user ? (
          <form onSubmit={handleComment} className={styles.commentForm}>
            <textarea
              className="input" placeholder="Share your thoughts…"
              value={comment} rows={3}
              onChange={e => setComment(e.target.value)}
              style={{resize:'vertical'}}
            />
            <div style={{display:'flex',justifyContent:'flex-end',marginTop:'10px'}}>
              <button type="submit" className="btn btn-primary" style={{padding:'8px 20px',fontSize:'13px'}} disabled={submitting || !comment.trim()}>
                {submitting ? 'Posting…' : 'Post comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.loginPrompt}>
            <Link to="/login" style={{color:'var(--accent2)'}}>Sign in</Link> to join the conversation
          </div>
        )}

        <div className={styles.commentList}>
          {(post.comments || []).map(c => (
            <div key={c.id} className={styles.comment}>
              <div className={styles.commentMeta}>
                <Link to={`/u/${c.username}`} style={{color:'var(--accent2)',fontWeight:500,fontSize:'14px'}}>{c.username}</Link>
                <span className="text-muted text-sm">{timeAgo(c.created_at)}</span>
              </div>
              <p className={styles.commentText}>{c.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
