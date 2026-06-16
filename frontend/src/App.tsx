import { useState, useEffect, useCallback } from 'react';
import { api } from './api/client';
import { User } from './api/types';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import ProfilePage from './pages/ProfilePage';
import StatsPage from './pages/StatsPage';

type Page = 'home' | 'login' | 'register' | 'post-detail' | 'create' | 'profile' | 'stats';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const me = await api.getMe();
      setUser(me);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const navigate = (p: Page, postId?: number) => {
    setSelectedPostId(postId || null);
    setPage(p);
    window.scrollTo(0, 0);
  };

  const handleLogin = async (token: string) => {
    localStorage.setItem('token', token);
    await checkAuth();
    navigate('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('home');
  };

  if (loading) {
    return <div className="loading">正在加载...</div>;
  }

  if (!user && (page === 'create' || page === 'profile')) {
    navigate('login');
  }

  return (
    <>
      {user && (
        <Navbar
          user={user}
          currentPage={page}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      )}

      {!user && page === 'login' && (
        <LoginPage
          onLogin={handleLogin}
          onSwitchToRegister={() => navigate('register')}
          onBack={() => navigate('home')}
        />
      )}

      {!user && page === 'register' && (
        <RegisterPage
          onRegister={handleLogin}
          onSwitchToLogin={() => navigate('login')}
          onBack={() => navigate('home')}
        />
      )}

      {page === 'home' && (
        <HomePage
          user={user}
          onNavigate={navigate}
          onLogin={() => navigate('login')}
        />
      )}

      {page === 'post-detail' && selectedPostId && (
        <PostDetailPage
          postId={selectedPostId}
          user={user}
          onBack={() => navigate('home')}
          onNavigate={navigate}
        />
      )}

      {page === 'create' && user && (
        <CreatePostPage
          onBack={() => navigate('home')}
          onCreated={() => navigate('home')}
        />
      )}

      {page === 'profile' && user && (
        <ProfilePage
          user={user}
          onNavigate={navigate}
        />
      )}

      {page === 'stats' && <StatsPage onNavigate={navigate} />}
    </>
  );
}
