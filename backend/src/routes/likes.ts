import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 点赞/取消点赞
router.post('/:postId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;

    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
    if (!post) {
      res.status(404).json({ error: '帖子不存在' });
      return;
    }

    const existing = db.prepare(
      'SELECT id FROM likes WHERE post_id = ? AND user_id = ?'
    ).get(postId, req.userId);

    if (existing) {
      db.prepare('DELETE FROM likes WHERE post_id = ? AND user_id = ?').run(postId, req.userId);
      res.json({ liked: false, message: '已取消点赞' });
    } else {
      db.prepare('INSERT INTO likes (post_id, user_id) VALUES (?, ?)').run(postId, req.userId);
      res.json({ liked: true, message: '点赞成功' });
    }
  } catch (err) {
    console.error('点赞操作失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
