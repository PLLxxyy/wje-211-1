import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { User, PostDetail, getMoodCss, getMoodEmoji } from '../api/types';

type Page = 'home' | 'login' | 'register' | 'post-detail' | 'create' | 'profile' | 'stats';

interface Props {
  postId: number;
  user: User | null;
  onBack: () => void;
  onNavigate: (page: Page, postId?: number) => void;
}

export default function PostDetailPage({ postId, user, onBack, onNavigate }: Props) {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const data = await api.getPost(postId);
      setPost(data);
    } catch {
      // 未登录时尝试获取
      try {
        const data = await api.getPost(postId);
        setPost(data);
      } catch {
        setPost(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }
    try {
      await api.toggleLike(postId);
      loadPost();
    } catch {
      // 忽略
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }
    try {
      await api.toggleFavorite(postId);
      loadPost();
    } catch {
      // 忽略
    }
  };

  const handleComment = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      await api.addComment(postId, commentText.trim());
      setCommentText('');
      loadPost();
    } catch {
      alert('评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这条帖子吗？')) return;
    try {
      await api.deletePost(postId);
      onBack();
    } catch {
      alert('删除失败');
    }
  };

  const handleAdminDelete = async () => {
    if (!confirm('确定要删除这条违规帖子吗？')) return;
    try {
      await api.adminDeletePost(postId);
      onBack();
    } catch {
      alert('删除失败');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('确定要删除这条评论吗？')) return;
    try {
      await api.deleteComment(commentId);
      loadPost();
    } catch {
      alert('删除失败');
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="layout"><div className="loading">正在加载...</div></div>;
  }

  if (!post) {
    return (
      <div className="layout">
        <div className="empty-state">
          <div className="empty-state-icon">😶</div>
          <div className="empty-state-text">帖子不存在或已被删除</div>
          <button className="btn btn-primary" onClick={onBack} style={{ marginTop: 16 }}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <div className="page">
        <button className="back-btn" onClick={onBack}>
          ← 返回
        </button>

        <div className="card">
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

          <div className="post-detail-content">
            {post.content}
          </div>

          <div className="post-actions" style={{ marginTop: 16 }}>
            <button
              className={`post-action ${post.liked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              {post.liked ? '❤️' : '🤍'} {post.like_count} 赞
            </button>
            <button
              className={`post-action ${post.favorited ? 'liked' : ''}`}
              onClick={handleFavorite}
            >
              {post.favorited ? '⭐' : '☆'} {post.favorited ? '已收藏' : '收藏'}
            </button>
            <span className="post-action">
              💬 {post.comment_count} 评论
            </span>
            {post.isOwner && (
              <button className="delete-btn" onClick={handleDelete}>
                🗑️ 删除
              </button>
            )}
            {user?.role === 'admin' && !post.isOwner && (
              <button className="delete-btn" onClick={handleAdminDelete}>
                ⚠️ 管理员删除
              </button>
            )}
          </div>
        </div>

        {/* 评论区 */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            💬 匿名评论 ({post.comments.length})
          </h3>

          {user && (
            <div className="comment-input-row">
              <input
                className="form-input"
                placeholder="写下你的匿名评论..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleComment(); }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={handleComment}
                disabled={submitting || !commentText.trim()}
              >
                {submitting ? '...' : '发送'}
              </button>
            </div>
          )}

          {!user && (
            <div style={{ textAlign: 'center', padding: 16, color: 'var(--gray-400)', fontSize: 14 }}>
              <span className="link" onClick={() => onNavigate('login')}>登录</span>
              后即可评论
            </div>
          )}

          <div className="comment-list">
            {post.comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)', fontSize: 14 }}>
                还没有评论，来说点什么吧
              </div>
            ) : (
              post.comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="comment-avatar">匿</div>
                      <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>匿名用户</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="comment-time">{formatTime(comment.created_at)}</span>
                      {user?.role === 'admin' && (
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteComment(comment.id)}
                          style={{ fontSize: 12, padding: '2px 6px' }}
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="comment-content" style={{ marginLeft: 36 }}>
                    {comment.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
