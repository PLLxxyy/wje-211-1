export interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

export interface Post {
  id: number;
  content: string;
  mood: string;
  created_at: string;
  like_count: number;
  comment_count: number;
  liked?: boolean;
  favorited?: boolean;
  isOwner?: boolean;
  user_id?: number;
}

export interface Comment {
  id: number;
  content: string;
  created_at: string;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
}

export interface PostDetail extends Post {
  comments: Comment[];
  liked: boolean;
  favorited: boolean;
  isOwner: boolean;
}

export interface DailyStat {
  date: string;
  count: number;
}

export interface MoodStat {
  mood: string;
  count: number;
}

export interface Overview {
  totalPosts: number;
  totalUsers: number;
  todayPosts: number;
}

export type Mood = '开心' | '烦恼' | '吐槽' | '表白' | '许愿';

export const MOOD_OPTIONS: { value: Mood; label: string; emoji: string; css: string }[] = [
  { value: '开心', label: '开心', emoji: '😊', css: 'mood-happy' },
  { value: '烦恼', label: '烦恼', emoji: '😟', css: 'mood-upset' },
  { value: '吐槽', label: '吐槽', emoji: '😤', css: 'mood-rant' },
  { value: '表白', label: '表白', emoji: '💕', css: 'mood-love' },
  { value: '许愿', label: '许愿', emoji: '🌟', css: 'mood-wish' },
];

export function getMoodCss(mood: string): string {
  const option = MOOD_OPTIONS.find(m => m.value === mood);
  return option ? option.css : 'mood-happy';
}

export function getMoodEmoji(mood: string): string {
  const option = MOOD_OPTIONS.find(m => m.value === mood);
  return option ? option.emoji : '📝';
}
