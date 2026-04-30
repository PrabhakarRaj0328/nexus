import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import styles from './Profile.module.css';

export default function Profile() {
  const { username } = useParams();
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    api.get(`/users/${username}`, token)
      .then(data => { setProfile(data); setFollowing(data.is_following); })
      .finally(() => setLoading(false));
  }, [username, token]);

  const handleFollow = async () => {
    if (!user) return;
    try {
      const data = await api.post(`/users/${username}/follow`, {}, token);
      setFollowing(data.following);
      setProfile(p => ({
        ...p,
        follower_count: parseInt(p.follower_count) + (data.following ? 1 : -1)
      }));
    } catch {}
  };

  const timeAgo = (date) => {
    const d = Math.floor((Date.now() - new Date(date)) / 1000);
    if (d < 86400) return 'today';
    return `${Math.floor(d/86400)}d ago`;
  };

  if (loading) return <div style={{textAlign:'center',padding:'60px',color:'var(--text2)'}}>Loading…</div>;
  if (!profile) return <div style={{textAlign:'center',padding:'60px',color:'var(--text2)'}}>User not found</div>;

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.profileCard}>
        <div className={styles.avatar}>
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt={profile.username} />
            : <span>{profile.username[0].toUpperCase()}</span>
          }
        </div>
        <div className={styles.info}>
          <h1 className={styles.username}>{profile.username}</h1>
          {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
          <div className={styles.stats}>
            <div className={styles.stat}><strong>{profile.post_count}</strong> <span>posts</span></div>
            <div className={styles.stat}><strong>{profile.follower_count}</strong> <span>followers</span></div>
            <div className={styles.stat}><strong>{profile.following_count}</strong> <span>following</span></div>
          </div>
        </div>
        {user && user.username !== username && (
          <button
            className={following ? 'btn btn-ghost' : 'btn btn-primary'}
            onClick={handleFollow}
            style={{alignSelf:'flex-start'}}
          >
            {following ? 'Unfollow' : '+ Follow'}
          </button>
        )}
      </div>

      <div className={styles.posts}>
        <h2 className={styles.postsTitle}>Posts by {profile.username}</h2>
        {profile.posts?.length === 0 ? (
          <div className={styles.empty}>No posts yet</div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {profile.posts?.map(post => (
              <Link key={post.id} to={`/post/${post.id}`} className={styles.postItem}>
                <div className={styles.postMeta}>
                  <span className={`badge cat-${post.category}`}>{post.category}</span>
                  <span className="text-sm text-muted">{timeAgo(post.created_at)}</span>
                </div>
                <h3 className={styles.postTitle}>{post.title}</h3>
                <div className={styles.postStats}>
                  <span className="text-sm text-muted">▲ {post.upvotes || 0}</span>
                  <span className="text-sm text-muted">💬 {post.comment_count || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
