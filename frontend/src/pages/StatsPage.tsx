import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { DailyStat, MoodStat, Overview, MOOD_OPTIONS } from '../api/types';

type Page = 'home' | 'login' | 'register' | 'post-detail' | 'create' | 'profile' | 'stats';

interface Props {
  onNavigate: (page: Page) => void;
}

const MOOD_COLORS: Record<string, string> = {
  '开心': '#f59e0b',
  '烦恼': '#ec4899',
  '吐槽': '#ef4444',
  '表白': '#f472b6',
  '许愿': '#3b82f6',
};

export default function StatsPage({ onNavigate }: Props) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [moodStats, setMoodStats] = useState<MoodStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [ov, ds, ms] = await Promise.all([
        api.getOverview(),
        api.getDailyStats(),
        api.getMoodStats(),
      ]);
      setOverview(ov);
      setDailyStats(ds);
      setMoodStats(ms);
    } catch {
      // 忽略
    } finally {
      setLoading(false);
    }
  };

  const maxDaily = Math.max(...dailyStats.map(d => d.count), 1);
  const maxMood = Math.max(...moodStats.map(m => m.count), 1);

  if (loading) {
    return <div className="layout"><div className="loading">正在加载...</div></div>;
  }

  return (
    <div className="layout">
      <div className="page">
        <button className="back-btn" onClick={() => onNavigate('home')}>
          ← 返回首页
        </button>

        <div className="page-header">
          <div>
            <div className="page-title">📊 数据统计</div>
            <div className="page-description">看看树洞的热闹程度</div>
          </div>
        </div>

        {/* 总览卡片 */}
        {overview && (
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-number">{overview.totalPosts}</div>
              <div className="stat-label">总帖子数</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{overview.totalUsers}</div>
              <div className="stat-label">注册用户</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{overview.todayPosts}</div>
              <div className="stat-label">今日发帖</div>
            </div>
          </div>
        )}

        {/* 每日发帖统计 */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
            📅 每日发帖趋势
          </h3>
          {dailyStats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)' }}>
              暂无数据
            </div>
          ) : (
            dailyStats.map(stat => (
              <div key={stat.date} className="chart-bar">
                <div className="chart-label">
                  {stat.date.slice(5)}
                </div>
                <div className="chart-bar-bg">
                  <div
                    className="chart-bar-fill"
                    style={{
                      width: `${(stat.count / maxDaily) * 100}%`,
                      background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
                    }}
                  >
                    {stat.count}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 情绪分布 */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
            🎭 情绪分布
          </h3>
          {moodStats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)' }}>
              暂无数据
            </div>
          ) : (
            moodStats.map(stat => {
              const option = MOOD_OPTIONS.find(m => m.value === stat.mood);
              const color = MOOD_COLORS[stat.mood] || '#6366f1';
              return (
                <div key={stat.mood} className="chart-bar">
                  <div className="chart-label">
                    {option?.emoji} {stat.mood}
                  </div>
                  <div className="chart-bar-bg">
                    <div
                      className="chart-bar-fill"
                      style={{
                        width: `${(stat.count / maxMood) * 100}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                      }}
                    >
                      {stat.count}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
