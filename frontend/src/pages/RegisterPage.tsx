import { useState } from 'react';
import { api } from '../api/client';

interface Props {
  onRegister: (token: string) => void;
  onSwitchToLogin: () => void;
  onBack: () => void;
}

export default function RegisterPage({ onRegister, onSwitchToLogin, onBack }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      const data = await api.register(username, password);
      onRegister(data.token);
    } catch (err: any) {
      setError(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-title">🕳️ 加入树洞</div>
        <div className="auth-subtitle">注册账号后即可匿名发帖，你的身份永远不会被公开</div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              className="form-input"
              type="text"
              placeholder="2-20个字符"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              className="form-input"
              type="password"
              placeholder="至少6个字符"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">确认密码</label>
            <input
              className="form-input"
              type="password"
              placeholder="再次输入密码"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={loading}
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>已有账号？</span>
          <span className="link" onClick={onSwitchToLogin} style={{ marginLeft: 4 }}>
            立即登录
          </span>
        </div>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <span className="link" onClick={onBack} style={{ fontSize: 13, color: 'var(--gray-400)' }}>
            返回首页浏览
          </span>
        </div>
      </div>
    </div>
  );
}
