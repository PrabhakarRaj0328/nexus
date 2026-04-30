import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import styles from './PostCard.module.css';

const categoryColors = {
  general: 'cat-general', tech: 'cat-tech', science: 'cat-science',
  art: 'cat-art', gaming: 'cat-gaming', meta: 'cat-meta'
};

export default function PostCard({ post, onVote }) {
  const { user, token } = useAuth();
  const [voting, setVoting] = useState(false);

  const handleVote = async (e) => {
    e.preventDefault();
    if (!user || voting) return;
    setVoting(true);
    try {
      const data = await api.post(`/posts/${post.id}/vote`, { vote_type: 'up' }, token);
      onVote?.(post.id, data.upvotes);
    } catch {}
    setVoting(false);
  };

  const timeAgo = (date) => {
    const d = Math.floor((Date.now() - new Date(date)) / 1000);
    if (d < 60) return `${d}s`;
    if (d < 3600) return `${Math.floor(d/60)}m`;
    if (d < 86400) return `${Math.floor(d/3600)}h`;
    return `${Math.floor(d/86400)}d`;
  };

  return (
    <Link to={`/post/${post.id}`} className={styles.card}>
      <div className={styles.vote}>
        <button
          className={`${styles.voteBtn} ${post.user_voted ? styles.voted : ''}`}
          onClick={handleVote}
          disabled={!user || voting}
          title={user ? 'Upvote' : 'Login to vote'}
        >▲</button>
        <span className={styles.count}>{post.upvotes || 0}</span>
      </div>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={`badge ${categoryColors[post.category] || 'cat-general'}`}>
            {post.category}
          </span>
          <span className="text-muted text-sm">
            by <strong style={{color:'var(--accent2)'}}>{post.username}</strong> · {timeAgo(post.created_at)}
          </span>
        </div>
        <h3 className={styles.title}>{post.title}</h3>
        <p className={styles.excerpt}>{post.content.slice(0, 180)}{post.content.length > 180 ? '…' : ''}</p>
        <div className={styles.footer}>
          <span className={styles.stat}>💬 {post.comment_count || 0} comments</span>
        </div>
      </div>
    </Link>
  );
}
