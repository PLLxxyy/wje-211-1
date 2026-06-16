import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/:postId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;

    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
    if (!post) {
      res.status(404).json({ error: '帖子不存在' });
      return;
    }

    const existing = db.prepare(
      'SELECT id FROM favorites WHERE post_id = ? AND user_id = ?'
    ).get(postId, req.userId);

    if (existing) {
      db.prepare('DELETE FROM favorites WHERE post_id = ? AND user_id = ?').run(postId, req.userId);
      res.json({ favorited: false, message: '已取消收藏' });
    } else {
      db.prepare('INSERT INTO favorites (post_id, user_id) VALUES (?, ?)').run(postId, req.userId);
      res.json({ favorited: true, message: '收藏成功' });
    }
  } catch (err) {
    console.error('收藏操作失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const posts = db.prepare(`
      SELECT p.id, p.content, p.mood, p.created_at,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      INNER JOIN favorites f ON f.post_id = p.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `).all(req.userId, limit, offset);

    const total = (db.prepare('SELECT COUNT(*) as total FROM favorites WHERE user_id = ?').get(req.userId) as any).total;

    res.json({ posts, total, page, limit });
  } catch (err) {
    console.error('获取收藏列表失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
