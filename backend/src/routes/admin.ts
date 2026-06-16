import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 管理员删除帖子
router.delete('/posts/:id', authMiddleware, adminMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(id);

    if (!post) {
      res.status(404).json({ error: '帖子不存在' });
      return;
    }

    db.prepare('DELETE FROM posts WHERE id = ?').run(id);
    res.json({ message: '帖子已删除' });
  } catch (err) {
    console.error('管理员删除帖子失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 管理员删除评论
router.delete('/comments/:id', authMiddleware, adminMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const comment = db.prepare('SELECT id FROM comments WHERE id = ?').get(id);

    if (!comment) {
      res.status(404).json({ error: '评论不存在' });
      return;
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(id);
    res.json({ message: '评论已删除' });
  } catch (err) {
    console.error('管理员删除评论失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取所有帖子（管理员）
router.get('/posts', authMiddleware, adminMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const posts = db.prepare(`
      SELECT p.id, p.content, p.mood, p.created_at, p.user_id,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const total = (db.prepare('SELECT COUNT(*) as total FROM posts').get() as any).total;

    res.json({ posts, total, page, limit });
  } catch (err) {
    console.error('获取管理员帖子列表失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
