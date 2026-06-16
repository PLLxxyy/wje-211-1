import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { User, Post, MOOD_OPTIONS, getMoodCss, getMoodEmoji } from '../api/types';

type Page = 'home' | 'login' | 'register' | 'post-detail' | 'create' | 'profile' | 'stats';

interface Props {
  user: User;
  onNavigate: (page: Page, postId?: number) => void;
}

export default function ProfilePage({ user, onNavigate }: Props) {
  const [tab, setTab] = useState<'mine' | 'admin'>('mine');
  const [posts, setPosts] = useState<Post[]>([]);
  const [adminPosts, setAdminPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [tab]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      if (tab === 'mine') {
        const data = await api.getMyPosts();
        setPosts(data.posts);
      } else {
        const data = await api.adminGetPosts();
        setAdminPosts(data.posts);
      }
    } catch {
      // 忽略
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMyPost = async (id: number) => {
    if (!confirm('确定要删除这条帖子吗？')) return;
    try {
      await api.deletePost(id);
      loadPosts();
    } catch {
      alert('删除失败');
    }
  };

  const handleAdminDeletePost = async (id: number) => {
    if (!confirm('确定要删除这条帖子吗？')) return;
    try {
      await api.adminDeletePost(id);
      loadPosts();
    } catch {
      alert('删除失败');
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="layout">
      <div className="page">
        {/* 用户信息 */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="post-avatar" style={{ width: 56, height: 56, fontSize: 24 }}>
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{user.username}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                {user.role === 'admin' ? '管理员' : '普通用户'}
                {user.role === 'admin' && <span className="admin-badge">管理员</span>}
              </div>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="tabs" style={{ maxWidth: user.role === 'admin' ? 400 : 200 }}>
          <button
            className={`tab ${tab === 'mine' ? 'active' : ''}`}
            onClick={() => setTab('mine')}
          >
            我的帖子
          </button>
          {user.role === 'admin' && (
            <button
              className={`tab ${tab === 'admin' ? 'active' : ''}`}
              onClick={() => setTab('admin')}
            >
              管理帖子
            </button>
          )}
        </div>

        {/* 我的帖子 */}
        {tab === 'mine' && (
          <>
            {loading ? (
              <div className="loading">正在加载...</div>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <div className="empty-state-text">你还没有发过帖子</div>
                <button
                  className="btn btn-primary"
                  onClick={() => onNavigate('create')}
                  style={{ marginTop: 16 }}
                >
                  去发帖
                </button>
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="post-card" style={{ cursor: 'pointer' }}>
                  <div
                    onClick={() => onNavigate('post-detail', post.id)}
                  >
                    <div className="post-header">
                      <div className="post-meta">
                        <span className={`mood-tag ${getMoodCss(post.mood)}`}>
                          {getMoodEmoji(post.mood)} {post.mood}
                        </span>
                      </div>
                      <span className="post-time">{formatTime(post.created_at)}</span>
                    </div>
                    <div className="post-content post-content-preview">
                      {post.content}
                    </div>
                  </div>
                  <div className="post-actions">
                    <span className="post-action">
                      ❤️ {post.like_count}
                    </span>
                    <span className="post-action">
                      💬 {post.comment_count}
                    </span>
                    <button
                      className="delete-btn"
                      onClick={(e) => { e.stopPropagation(); handleDeleteMyPost(post.id); }}
                    >
                      🗑️ 删除
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* 管理员帖子管理 */}
        {tab === 'admin' && user.role === 'admin' && (
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              所有帖子管理
            </h3>
            {loading ? (
              <div className="loading">正在加载...</div>
            ) : adminPosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)' }}>
                暂无帖子
              </div>
            ) : (
              adminPosts.map(post => (
                <div key={post.id} className="admin-post-row">
                  <div className="admin-post-info">
                    <div className="admin-post-content" onClick={() => onNavigate('post-detail', post.id)} style={{ cursor: 'pointer' }}>
                      <span className={`mood-tag ${getMoodCss(post.mood)}`} style={{ marginRight: 8 }}>
                        {post.mood}
                      </span>
                      {post.content}
                    </div>
                    <div className="admin-post-meta">
                      {formatTime(post.created_at)} · {post.like_count}赞 · {post.comment_count}评论
                    </div>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleAdminDeletePost(post.id)}
                    style={{ flexShrink: 0, marginLeft: 12 }}
                  >
                    删除
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
