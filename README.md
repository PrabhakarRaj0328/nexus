# ⬡ Nexus — Social Community App

A full-stack social community platform built with **React + Node.js + PostgreSQL**, ready to deploy on **Railway**.

## ✨ Features

- 🔐 **Real authentication** — JWT-based login/signup with bcrypt password hashing
- 📝 **Posts** — Create, read, delete posts with categories
- 👍 **Voting** — Upvote/downvote system (toggle-based)
- 💬 **Comments** — Threaded comments on posts
- 👤 **Profiles** — User profiles with bio, stats, post history
- 🔔 **Follow system** — Follow/unfollow other users
- 🗄️ **PostgreSQL** — Full relational database with proper foreign keys

---

## 📁 Project Structure

```
community-app/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── config/database.js    # PostgreSQL pool + schema init
│   │   ├── controllers/          # Business logic
│   │   ├── middleware/auth.js    # JWT middleware
│   │   └── routes/index.js      # All API routes
│   ├── .env.example
│   └── railway.json
└── frontend/         # React + Vite
    ├── src/
    │   ├── context/AuthContext.jsx   # Global auth state
    │   ├── pages/                    # Home, Login, Register, etc.
    │   ├── components/               # Navbar, PostCard
    │   └── utils/api.js              # Fetch wrapper
    └── .env.example
```

---

## 🚀 Deploy on Railway (Step-by-Step)

### Step 1 — Push to GitHub

```bash
cd community-app
git init
git add .
git commit -m "Initial commit"
# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/nexus-community.git
git push -u origin main
```

### Step 2 — Set up Railway

1. Go to **[railway.app](https://railway.app)** → Sign up / Login
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository

### Step 3 — Add PostgreSQL Database

1. In your Railway project, click **"+ Add Service"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will provision a database automatically

### Step 4 — Deploy the Backend

1. Click **"+ Add Service"** → **"GitHub Repo"**
2. Set **Root Directory** to `/backend`
3. Add these Environment Variables:
   ```
   DATABASE_URL    → (copy from your PostgreSQL service → "Connect" tab)
   JWT_SECRET      → (any random long string, e.g. use: openssl rand -hex 32)
   NODE_ENV        → production
   FRONTEND_URL    → https://your-frontend.railway.app  (set after frontend deploy)
   PORT            → 4000
   ```
4. The backend will auto-start with `node src/index.js`
5. Go to **Settings** → **Networking** → **Generate Domain**
6. Copy your backend URL (e.g. `https://nexus-backend-production.up.railway.app`)

### Step 5 — Deploy the Frontend

1. Click **"+ Add Service"** → **"GitHub Repo"** (same repo)
2. Set **Root Directory** to `/frontend`
3. Set **Build Command**: `npm run build`
4. Set **Start Command**: `npx serve dist -l $PORT`
5. Add Environment Variable:
   ```
   VITE_API_URL → https://your-backend.railway.app/api
   ```
6. Go to **Settings** → **Networking** → **Generate Domain**

### Step 6 — Update CORS

1. Go back to your **backend** service
2. Update `FRONTEND_URL` to your frontend Railway domain
3. Redeploy backend

### ✅ Done! Your app is live.

---

## 💻 Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your local PostgreSQL credentials
npm run dev     # starts on port 4000
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# .env: VITE_API_URL=http://localhost:4000/api
npm run dev     # starts on port 5173
```

### Local PostgreSQL

```bash
# Create database
psql -U postgres
CREATE DATABASE community_db;
\q

# The tables are created automatically on first backend start
```

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| GET | `/api/posts` | optional | List posts |
| POST | `/api/posts` | ✅ | Create post |
| GET | `/api/posts/:id` | optional | Get post + comments |
| DELETE | `/api/posts/:id` | ✅ | Delete own post |
| POST | `/api/posts/:id/vote` | ✅ | Vote on post |
| POST | `/api/posts/:id/comments` | ✅ | Add comment |
| GET | `/api/users/:username` | optional | Get user profile |
| POST | `/api/users/:username/follow` | ✅ | Follow/unfollow |
| GET | `/api/users/search?q=` | optional | Search users |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6, Vite |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL (via `pg` driver) |
| Auth | JWT + bcryptjs |
| Deployment | Railway |
| Fonts | DM Serif Display + Sora |

---

## 🔧 Extending the App

### Add image uploads
Use [Cloudinary](https://cloudinary.com) or [Supabase Storage](https://supabase.com/storage) — store the URL in `avatar_url`.

### Add real-time notifications
Add [Socket.io](https://socket.io) to the backend for live comment/vote notifications.

### Add email verification
Use [Resend](https://resend.com) or [Nodemailer](https://nodemailer.com) with an email template.

### Add search
Add `tsvector` full-text search index on posts table:
```sql
ALTER TABLE posts ADD COLUMN search_vector tsvector;
CREATE INDEX posts_search_idx ON posts USING GIN(search_vector);
```
