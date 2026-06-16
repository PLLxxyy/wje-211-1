import { User } from '../api/types';

type Page = 'home' | 'login' | 'register' | 'post-detail' | 'create' | 'profile' | 'stats';

interface Props {
  user: User;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export default function Navbar({ user, currentPage, onNavigate, onLogout }: Props) {
  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => onNavigate('home')}>
        <span>🕳️</span>
        匿名树洞
      </div>
      <div className="navbar-links">
        <button
          className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => onNavigate('home')}
        >
          首页
        </button>
        <button
          className={`nav-link ${currentPage === 'create' ? 'active' : ''}`}
          onClick={() => onNavigate('create')}
        >
          发帖
        </button>
        <button
          className={`nav-link ${currentPage === 'stats' ? 'active' : ''}`}
          onClick={() => onNavigate('stats')}
        >
          统计
        </button>
        <button
          className={`nav-link ${currentPage === 'profile' ? 'active' : ''}`}
          onClick={() => onNavigate('profile')}
        >
          我的
        </button>
        {user.role === 'admin' && (
          <span className="admin-badge">管理员</span>
        )}
        <button className="nav-link danger" onClick={onLogout}>
          退出
        </button>
      </div>
    </nav>
  );
}
