const { pool } = require('../config/database');

const getPosts = async (req, res) => {
  const { category, page = 1, limit = 20, sort = 'new' } = req.query;
  const offset = (page - 1) * limit;
  const userId = req.user?.id || null;

  const orderBy = sort === 'top' ? 'p.upvotes DESC' : 'p.created_at DESC';
  const catFilter = category && category !== 'all' ? 'AND p.category=$3' : '';
  const params = category && category !== 'all'
    ? [userId, limit, category, offset]
    : [userId, limit, offset];

  try {
    const q = `
      SELECT p.*, u.username, u.avatar_url,
             COUNT(DISTINCT c.id) AS comment_count,
             CASE WHEN pv.vote_type='up' THEN true ELSE false END AS user_voted
      FROM posts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN comments c ON c.post_id = p.id
      LEFT JOIN post_votes pv ON pv.post_id = p.id AND pv.user_id=$1
      WHERE 1=1 ${catFilter}
      GROUP BY p.id, u.username, u.avatar_url, pv.vote_type
      ORDER BY ${orderBy}
      LIMIT $2 OFFSET ${category && category !== 'all' ? '$4' : '$3'}
    `;
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getPost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id || null;
  try {
    const post = await pool.query(
      `SELECT p.*, u.username, u.avatar_url,
              CASE WHEN pv.vote_type='up' THEN true ELSE false END AS user_voted
       FROM posts p
       JOIN users u ON u.id=p.user_id
       LEFT JOIN post_votes pv ON pv.post_id=p.id AND pv.user_id=$2
       WHERE p.id=$1
       GROUP BY p.id, u.username, u.avatar_url, pv.vote_type`,
      [id, userId]
    );
    if (post.rows.length === 0) return res.status(404).json({ error: 'Post not found' });

    const comments = await pool.query(
      `SELECT c.*, u.username, u.avatar_url
       FROM comments c JOIN users u ON u.id=c.user_id
       WHERE c.post_id=$1 ORDER BY c.created_at ASC`,
      [id]
    );
    res.json({ ...post.rows[0], comments: comments.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createPost = async (req, res) => {
  const { title, content, category = 'general' } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
  try {
    const result = await pool.query(
      `INSERT INTO posts (user_id, title, content, category)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, title, content, category]
    );
    const post = result.rows[0];
    const user = await pool.query('SELECT username, avatar_url FROM users WHERE id=$1', [req.user.id]);
    res.status(201).json({ ...post, ...user.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM posts WHERE id=$1 AND user_id=$2 RETURNING id', [id, req.user.id]);
    if (result.rows.length === 0) return res.status(403).json({ error: 'Not authorized' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const votePost = async (req, res) => {
  const { id } = req.params;
  const { vote_type } = req.body;
  if (!['up', 'down'].includes(vote_type)) return res.status(400).json({ error: 'Invalid vote' });

  try {
    const existing = await pool.query(
      'SELECT * FROM post_votes WHERE post_id=$1 AND user_id=$2', [id, req.user.id]
    );

    let delta = 0;
    if (existing.rows.length > 0) {
      if (existing.rows[0].vote_type === vote_type) {
        await pool.query('DELETE FROM post_votes WHERE post_id=$1 AND user_id=$2', [id, req.user.id]);
        delta = vote_type === 'up' ? -1 : 1;
      } else {
        await pool.query('UPDATE post_votes SET vote_type=$1 WHERE post_id=$2 AND user_id=$3', [vote_type, id, req.user.id]);
        delta = vote_type === 'up' ? 2 : -2;
      }
    } else {
      await pool.query('INSERT INTO post_votes (post_id, user_id, vote_type) VALUES ($1,$2,$3)', [id, req.user.id, vote_type]);
      delta = vote_type === 'up' ? 1 : -1;
    }

    const result = await pool.query(
      'UPDATE posts SET upvotes=upvotes+$1 WHERE id=$2 RETURNING upvotes', [delta, id]
    );
    res.json({ upvotes: result.rows[0].upvotes });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const addComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  try {
    const result = await pool.query(
      `INSERT INTO comments (post_id, user_id, content) VALUES ($1,$2,$3) RETURNING *`,
      [id, req.user.id, content]
    );
    const user = await pool.query('SELECT username, avatar_url FROM users WHERE id=$1', [req.user.id]);
    res.status(201).json({ ...result.rows[0], ...user.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getPosts, getPost, createPost, deletePost, votePost, addComment };
