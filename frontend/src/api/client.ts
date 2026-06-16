const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || '请求失败');
  }

  return data;
}

export const api = {
  // 认证
  register: (username: string, password: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) }),

  login: (username: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  getMe: () => request('/auth/me'),

  // 帖子
  getPosts: (params?: { page?: number; mood?: string; hot?: string }) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.mood) sp.set('mood', params.mood);
    if (params?.hot) sp.set('hot', params.hot);
    return request(`/posts?${sp.toString()}`);
  },

  getPost: (id: number) => request(`/posts/${id}`),

  createPost: (content: string, mood: string) =>
    request('/posts', { method: 'POST', body: JSON.stringify({ content, mood }) }),

  deletePost: (id: number) =>
    request(`/posts/${id}`, { method: 'DELETE' }),

  getMyPosts: (page?: number) =>
    request(`/posts/user/mine?page=${page || 1}`),

  // 评论
  addComment: (postId: number, content: string) =>
    request(`/comments/${postId}`, { method: 'POST', body: JSON.stringify({ content }) }),

  deleteComment: (id: number) =>
    request(`/comments/${id}`, { method: 'DELETE' }),

  // 点赞
  toggleLike: (postId: number) =>
    request(`/likes/${postId}`, { method: 'POST' }),

  // 收藏
  toggleFavorite: (postId: number) =>
    request(`/favorites/${postId}`, { method: 'POST' }),

  getMyFavorites: (page?: number) =>
    request(`/favorites?page=${page || 1}`),

  // 管理员
  adminDeletePost: (id: number) =>
    request(`/admin/posts/${id}`, { method: 'DELETE' }),

  adminDeleteComment: (id: number) =>
    request(`/admin/comments/${id}`, { method: 'DELETE' }),

  adminGetPosts: (page?: number) =>
    request(`/admin/posts?page=${page || 1}`),

  // 统计
  getDailyStats: () => request('/stats/daily'),
  getMoodStats: () => request('/stats/moods'),
  getOverview: () => request('/stats/overview'),
};
