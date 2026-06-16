import { Router, Response } from 'express';
import db from '../db';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// 每日发帖统计（最近30天）
router.get('/daily', (req: AuthRequest, res: Response) => {
  try {
    const stats = db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM posts
      WHERE created_at >= DATE('now', '-30 days', 'localtime')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all();

    res.json(stats);
  } catch (err) {
    console.error('获取统计数据失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 情绪分布统计
router.get('/moods', (req: AuthRequest, res: Response) => {
  try {
    const stats = db.prepare(`
      SELECT mood, COUNT(*) as count
      FROM posts
      GROUP BY mood
      ORDER BY count DESC
    `).all();

    res.json(stats);
  } catch (err) {
    console.error('获取情绪统计失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 总体统计
router.get('/overview', (req: AuthRequest, res: Response) => {
  try {
    const totalPosts = (db.prepare('SELECT COUNT(*) as count FROM posts').get() as any).count;
    const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
    const todayPosts = (db.prepare(
      "SELECT COUNT(*) as count FROM posts WHERE DATE(created_at) = DATE('now', 'localtime')"
    ).get() as any).count;

    res.json({ totalPosts, totalUsers, todayPosts });
  } catch (err) {
    console.error('获取总体统计失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
