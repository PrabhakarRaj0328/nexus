import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import styles from './App.module.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center" style={{justifyContent:'center',height:'100vh',color:'var(--text2)'}}>Loading…</div>;
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <div className={styles.app}>
      <Navbar />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/u/:username" element={<Profile />} />
          <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}
