const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, email, password } = req.body;
  try {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email=$1 OR username=$2', [email, username]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email or username already taken' });
    }
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, bio, avatar_url, created_at`,
      [username, email, hash]
    );
    const user = result.rows[0];
    res.status(201).json({ token: generateToken(user), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email=$1', [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { password_hash, ...safeUser } = user;
    res.json({ token: generateToken(safeUser), user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.bio, u.avatar_url, u.created_at,
              COUNT(DISTINCT p.id) AS post_count,
              COUNT(DISTINCT f1.following_id) AS following_count,
              COUNT(DISTINCT f2.follower_id) AS follower_count
       FROM users u
       LEFT JOIN posts p ON p.user_id = u.id
       LEFT JOIN follows f1 ON f1.follower_id = u.id
       LEFT JOIN follows f2 ON f2.following_id = u.id
       WHERE u.id=$1
       GROUP BY u.id`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  const { bio, avatar_url } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET bio=$1, avatar_url=$2, updated_at=NOW()
       WHERE id=$3
       RETURNING id, username, email, bio, avatar_url`,
      [bio, avatar_url, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, login, getMe, updateProfile };
