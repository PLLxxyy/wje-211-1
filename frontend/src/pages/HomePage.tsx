import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { User, Post, MOOD_OPTIONS, getMoodCss, getMoodEmoji } from '../api/types';

type Page = 'home' | 'login' | 'register' | 'post-detail' | 'create' | 'profile' | 'stats';

interface Props {
  user: User | null;
  onNavigate: (page: Page, postId?: number) => void;
  onLogin: () => void;
}

export default function HomePage({ user, onNavigate, onLogin }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [hotPosts, setHotPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMood, setFilterMood] = useState<string>('');
  const [tab, setTab] = useState<'latest' | 'hot'>('latest');

  useEffect(() => {
    loadPosts();
  }, [filterMood, tab]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterMood) params.mood = filterMood;
      if (tab === 'hot') params.hot = 'today';

      const data = await api.getPosts(params);
      setPosts(data.posts);

      // 加载今日热帖（用于侧栏）
      if (tab === 'latest') {
        try {
          const hotData = await api.getPosts({ hot: 'today' });
          setHotPosts(hotData.posts.slice(0, 5));
        } catch {
          // 未登录时可能失败，忽略
        }
      }
    } catch {
      // 未登录时也能浏览
      try {
        const data = await api.getPosts({});
        setPosts(data.posts);
      } catch {
        setPosts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onLogin();
      return;
    }
    try {
      await api.toggleLike(postId);
      loadPosts();
    } catch {
      // 忽略
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="layout">
      <div className="page">
        <div className="page-header">
          <div>
            <div className="page-title">🕳️ 匿名树洞</div>
            <div className="page-description">说出你的心里话，没有人知道你是谁</div>
          </div>
          {!user && (
            <button className="btn btn-primary" onClick={onLogin}>
              登录发帖
            </button>
          )}
        </div>

        <div className="two-col">
          <div>
            {/* 标签页 */}
            <div className="tabs">
              <button
                className={`tab ${tab === 'latest' ? 'active' : ''}`}
                onClick={() => setTab('latest')}
              >
                最新
              </button>
              <button
                className={`tab ${tab === 'hot' ? 'active' : ''}`}
                onClick={() => setTab('hot')}
              >
                今日热帖
              </button>
            </div>

            {/* 情绪过滤 */}
            <div className="filter-bar">
              <span
                className={`filter-chip ${!filterMood ? 'active' : ''}`}
                onClick={() => setFilterMood('')}
              >
                全部
              </span>
              {MOOD_OPTIONS.map(m => (
                <span
                  key={m.value}
                  className={`filter-chip ${filterMood === m.value ? 'active' : ''}`}
                  onClick={() => setFilterMood(filterMood === m.value ? '' : m.value)}
                >
                  {m.emoji} {m.label}
                </span>
              ))}
            </div>

            {/* 帖子列表 */}
            {loading ? (
              <div className="loading">正在加载...</div>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <div className="empty-state-text">还没有帖子</div>
                <div className="empty-state-sub">成为第一个发帖的人吧！</div>
              </div>
            ) : (
              <div className="waterfall">
                {posts.map(post => (
                  <div
                    key={post.id}
                    className="post-card"
                    onClick={() => onNavigate('post-detail', post.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="post-header">
                      <div className="post-meta">
                        <div className="post-avatar">🤫</div>
                        <div>
                          <span className={`mood-tag ${getMoodCss(post.mood)}`}>
                            {getMoodEmoji(post.mood)} {post.mood}
                          </span>
                        </div>
                      </div>
                      <span className="post-time">{formatTime(post.created_at)}</span>
                    </div>

                    <div className="post-content post-content-preview">
                      {post.content}
                    </div>

                    <div className="post-actions" onClick={e => e.stopPropagation()}>
                      <button
                        className={`post-action ${post.like_count > 0 ? 'liked' : ''}`}
                        onClick={(e) => handleLike(post.id, e)}
                      >
                        {post.like_count > 0 ? '❤️' : '🤍'} {post.like_count}
                      </button>
                      <button
                        className="post-action"
                        onClick={() => onNavigate('post-detail', post.id)}
                      >
                        💬 {post.comment_count}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 侧栏 - 今日热帖 */}
          <div className="sidebar-card card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--gray-800)' }}>
              🔥 今日热帖
            </h3>
            {hotPosts.length === 0 ? (
              <div style={{ color: 'var(--gray-400)', fontSize: 14, textAlign: 'center', padding: 20 }}>
                暂无热帖
              </div>
            ) : (
              hotPosts.map((post, idx) => (
                <div
                  key={post.id}
                  className="hot-rank-item"
                  onClick={() => onNavigate('post-detail', post.id)}
                >
                  <div className={`hot-rank-num ${idx === 0 ? 'top-1' : idx === 1 ? 'top-2' : idx === 2 ? 'top-3' : ''}`}>
                    {idx + 1}
                  </div>
                  <div className="hot-rank-content">
                    <div className="hot-rank-text">{post.content}</div>
                    <div className="hot-rank-likes">
                      {getMoodEmoji(post.mood)} {post.like_count} 赞
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 浮动发帖按钮 */}
      {user && (
        <button className="fab" onClick={() => onNavigate('create')} title="发帖">
          ✏️
        </button>
      )}
    </div>
  );
}
