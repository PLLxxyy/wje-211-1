import { useState } from 'react';
import { api } from '../api/client';
import { Mood, MOOD_OPTIONS } from '../api/types';

interface Props {
  onBack: () => void;
  onCreated: () => void;
}

export default function CreatePostPage({ onBack, onCreated }: Props) {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('请输入帖子内容');
      return;
    }
    if (!mood) {
      setError('请选择一个情绪标签');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.createPost(content.trim(), mood);
      onCreated();
    } catch (err: any) {
      setError(err.message || '发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      <div className="page" style={{ maxWidth: 600, margin: '0 auto' }}>
        <button className="back-btn" onClick={onBack}>
          ← 返回
        </button>

        <div className="card">
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: 'var(--gray-900)' }}>
            ✏️ 写下你的心里话
          </h2>

          <div style={{ marginBottom: 8 }}>
            <span className="form-label">选择情绪</span>
          </div>
          <div className="mood-selector">
            {MOOD_OPTIONS.map(m => (
              <div
                key={m.value}
                className={`mood-option ${mood === m.value ? 'selected' : ''}`}
                onClick={() => setMood(m.value)}
              >
                {m.emoji} {m.label}
              </div>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">帖子内容</label>
            <textarea
              className="form-input form-textarea"
              placeholder="在这里写下你想说的话...&#10;没有人会知道是你写的"
              value={content}
              onChange={e => setContent(e.target.value)}
              maxLength={2000}
              style={{ minHeight: 160 }}
            />
            <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>
              {content.length} / 2000
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onBack}>
              取消
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading || !content.trim() || !mood}
            >
              {loading ? '发布中...' : '匿名发布'}
            </button>
          </div>

          <div style={{ marginTop: 16, padding: 12, background: 'var(--gray-50)', borderRadius: 8, fontSize: 13, color: 'var(--gray-500)' }}>
            🔒 你的身份信息不会显示在帖子中，所有帖子均以匿名方式展示。
          </div>
        </div>
      </div>
    </div>
  );
}
