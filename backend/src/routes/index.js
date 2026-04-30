const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateProfile } = require('../controllers/auth.controller');
const { getPosts, getPost, createPost, deletePost, votePost, addComment } = require('../controllers/posts.controller');
const { getUser, followUser, searchUsers } = require('../controllers/users.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Auth routes
router.post('/auth/register', [
  body('username').trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], register);

router.post('/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], login);

router.get('/auth/me', authenticate, getMe);
router.put('/auth/profile', authenticate, updateProfile);

// Posts routes
router.get('/posts', optionalAuth, getPosts);
router.get('/posts/:id', optionalAuth, getPost);
router.post('/posts', authenticate, createPost);
router.delete('/posts/:id', authenticate, deletePost);
router.post('/posts/:id/vote', authenticate, votePost);
router.post('/posts/:id/comments', authenticate, addComment);

// Users routes
router.get('/users/search', optionalAuth, searchUsers);
router.get('/users/:username', optionalAuth, getUser);
router.post('/users/:username/follow', authenticate, followUser);

module.exports = router;
