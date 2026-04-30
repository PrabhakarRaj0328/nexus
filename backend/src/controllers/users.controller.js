const { pool } = require('../config/database');

const getUser = async (req, res) => {
  const { username } = req.params;
  const viewerId = req.user?.id || null;
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.bio, u.avatar_url, u.created_at,
              COUNT(DISTINCT p.id) AS post_count,
              COUNT(DISTINCT f1.following_id) AS following_count,
              COUNT(DISTINCT f2.follower_id) AS follower_count,
              CASE WHEN fv.follower_id IS NOT NULL THEN true ELSE false END AS is_following
       FROM users u
       LEFT JOIN posts p ON p.user_id=u.id
       LEFT JOIN follows f1 ON f1.follower_id=u.id
       LEFT JOIN follows f2 ON f2.following_id=u.id
       LEFT JOIN follows fv ON fv.follower_id=$2 AND fv.following_id=u.id
       WHERE u.username=$1
       GROUP BY u.id, fv.follower_id`,
      [username, viewerId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const posts = await pool.query(
      `SELECT p.*, COUNT(c.id) AS comment_count
       FROM posts p LEFT JOIN comments c ON c.post_id=p.id
       WHERE p.user_id=$1 GROUP BY p.id ORDER BY p.created_at DESC LIMIT 20`,
      [result.rows[0].id]
    );
    res.json({ ...result.rows[0], posts: posts.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const followUser = async (req, res) => {
  const { username } = req.params;
  try {
    const target = await pool.query('SELECT id FROM users WHERE username=$1', [username]);
    if (target.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const targetId = target.rows[0].id;
    if (targetId === req.user.id) return res.status(400).json({ error: 'Cannot follow yourself' });

    const existing = await pool.query(
      'SELECT * FROM follows WHERE follower_id=$1 AND following_id=$2', [req.user.id, targetId]
    );
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM follows WHERE follower_id=$1 AND following_id=$2', [req.user.id, targetId]);
      res.json({ following: false });
    } else {
      await pool.query('INSERT INTO follows (follower_id, following_id) VALUES ($1,$2)', [req.user.id, targetId]);
      res.json({ following: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const searchUsers = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  try {
    const result = await pool.query(
      `SELECT id, username, bio, avatar_url FROM users
       WHERE username ILIKE $1 OR bio ILIKE $1 LIMIT 10`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getUser, followUser, searchUsers };
