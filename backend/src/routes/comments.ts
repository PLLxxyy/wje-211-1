import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 添加评论
router.post('/:postId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: '评论内容不能为空' });
      return;
    }

    if (content.length > 500) {
      res.status(400).json({ error: '评论内容不能超过500个字符' });
      return;
    }

    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
    if (!post) {
      res.status(404).json({ error: '帖子不存在' });
      return;
    }

    const result = db.prepare(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)'
    ).run(postId, req.userId, content.trim());

    res.json({ id: result.lastInsertRowid, message: '评论成功' });
  } catch (err) {
    console.error('添加评论失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除评论（仅自己的）
router.delete('/:commentId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const comment = db.prepare('SELECT user_id FROM comments WHERE id = ?').get(commentId) as any;

    if (!comment) {
      res.status(404).json({ error: '评论不存在' });
      return;
    }

    if (comment.user_id !== req.userId) {
      res.status(403).json({ error: '只能删除自己的评论' });
      return;
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);
    res.json({ message: '评论已删除' });
  } catch (err) {
    console.error('删除评论失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
