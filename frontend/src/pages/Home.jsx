import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import styles from './Home.module.css';

const CATEGORIES = ['all', 'general', 'tech', 'science', 'art', 'gaming', 'meta'];

export default function Home() {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('new');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ category, sort });
      const data = await api.get(`/posts?${params}`, token);
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, sort, token]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleVote = (postId, newUpvotes) => {
    setPosts(p => p.map(post =>
      post.id === postId ? { ...post, upvotes: newUpvotes } : post
    ));
  };

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.hero}>
        <h1 className="font-display" style={{fontSize:'42px',lineHeight:1.2}}>
          Where ideas<br /><em>take shape.</em>
        </h1>
        <p style={{color:'var(--text2)',marginTop:'12px',fontSize:'16px'}}>
          Join the conversation. Share knowledge. Build community.
        </p>
      </div>

      <div className={styles.layout}>
        <div className={styles.feed}>
          <div className={styles.filters}>
            <div className={styles.cats}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`${styles.catBtn} ${category === cat ? styles.active : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className={styles.sorts}>
              <button className={`${styles.sortBtn} ${sort==='new' ? styles.active : ''}`} onClick={() => setSort('new')}>🕐 New</button>
              <button className={`${styles.sortBtn} ${sort==='top' ? styles.active : ''}`} onClick={() => setSort('top')}>🔥 Top</button>
            </div>
          </div>

          {loading ? (
            <div className={styles.loading}>
              {[1,2,3,4].map(i => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : posts.length === 0 ? (
            <div className={styles.empty}>
              <p>No posts yet in this category.</p>
              <p style={{color:'var(--text3)',fontSize:'14px',marginTop:'4px'}}>Be the first to share something!</p>
            </div>
          ) : (
            <div className={styles.posts}>
              {posts.map(post => (
                <PostCard key={post.id} post={post} onVote={handleVote} />
              ))}
            </div>
          )}
        </div>

        <aside className={styles.sidebar}>
          <div className="card">
            <h3 style={{fontSize:'16px',fontWeight:600,marginBottom:'12px'}}>About Nexus</h3>
            <p className="text-muted text-sm" style={{lineHeight:'1.7'}}>
              A community-driven space for thoughtful discussion across technology, science, art, gaming, and beyond.
            </p>
          </div>
          <div className="card" style={{marginTop:'12px'}}>
            <h3 style={{fontSize:'15px',fontWeight:600,marginBottom:'12px'}}>Community Rules</h3>
            {['Be respectful and kind', 'Share original content', 'No spam or self-promotion', 'Stay on topic', 'Have fun!']
              .map((r, i) => (
                <div key={i} style={{display:'flex',gap:'10px',padding:'6px 0',borderBottom: i < 4 ? '1px solid var(--border)' : 'none'}}>
                  <span style={{color:'var(--accent)',fontWeight:600,minWidth:'20px'}}>{i+1}.</span>
                  <span className="text-sm text-muted">{r}</span>
                </div>
              ))
            }
          </div>
        </aside>
      </div>
    </div>
  );
}
