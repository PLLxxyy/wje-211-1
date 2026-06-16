import { useState } from 'react';
import { api } from '../api/client';

interface Props {
  onLogin: (token: string) => void;
  onSwitchToRegister: () => void;
  onBack: () => void;
}

export default function LoginPage({ onLogin, onSwitchToRegister, onBack }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(username, password);
      onLogin(data.token);
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-title">🕳️ 匿名树洞</div>
        <div className="auth-subtitle">登录后即可匿名发帖，说出你的心里话</div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              className="form-input"
              type="text"
              placeholder="请输入用户名"
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
              placeholder="请输入密码"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>还没有账号？</span>
          <span className="link" onClick={onSwitchToRegister} style={{ marginLeft: 4 }}>
            立即注册
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
