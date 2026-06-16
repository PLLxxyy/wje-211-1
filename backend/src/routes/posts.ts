import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 获取帖子列表（瀑布流）
router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const mood = req.query.mood as string;
    const hot = req.query.hot as string;

    let query = `
      SELECT p.id, p.content, p.mood, p.created_at,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
    `;
    const params: any[] = [];

    if (mood) {
      query += ' WHERE p.mood = ?';
      params.push(mood);
    }

    if (hot === 'today') {
      query += mood ? ' AND' : ' WHERE';
      query += " DATE(p.created_at) = DATE('now', 'localtime')";
      query += ' ORDER BY like_count DESC, p.created_at DESC';
    } else {
      query += ' ORDER BY p.created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const posts = db.prepare(query).all(...params);

    const countQuery = `SELECT COUNT(*) as total FROM posts ${mood ? 'WHERE mood = ?' : ''}`;
    const total = mood
      ? (db.prepare(countQuery).get(mood) as any).total
      : (db.prepare(countQuery).get() as any).total;

    res.json({ posts, total, page, limit });
  } catch (err) {
    console.error('获取帖子列表失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取我的帖子（必须在 /:id 之前）
router.get('/user/mine', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const posts = db.prepare(`
      SELECT p.id, p.content, p.mood, p.created_at,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(req.userId, limit, offset);

    const total = (db.prepare('SELECT COUNT(*) as total FROM posts WHERE user_id = ?').get(req.userId) as any).total;

    res.json({ posts, total, page, limit });
  } catch (err) {
    console.error('获取我的帖子失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取帖子详情
router.get('/:id', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const post = db.prepare(`
      SELECT p.id, p.content, p.mood, p.created_at, p.user_id,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p WHERE p.id = ?
    `).get(id) as any;

    if (!post) {
      res.status(404).json({ error: '帖子不存在' });
      return;
    }

    const comments = db.prepare(`
      SELECT c.id, c.content, c.created_at
      FROM comments c WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `).all(id);

    // 检查当前用户是否已点赞
    let liked = false;
    let favorited = false;
    if (req.userId) {
      const like = db.prepare('SELECT id FROM likes WHERE post_id = ? AND user_id = ?').get(id, req.userId);
      liked = !!like;
      const fav = db.prepare('SELECT id FROM favorites WHERE post_id = ? AND user_id = ?').get(id, req.userId);
      favorited = !!fav;
    }

    const isOwner = req.userId === post.user_id;

    res.json({ ...post, comments, liked, favorited, isOwner });
  } catch (err) {
    console.error('获取帖子详情失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建帖子
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { content, mood } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: '帖子内容不能为空' });
      return;
    }

    if (!mood || !['开心', '烦恼', '吐槽', '表白', '许愿'].includes(mood)) {
      res.status(400).json({ error: '请选择有效的情绪标签' });
      return;
    }

    if (content.length > 2000) {
      res.status(400).json({ error: '帖子内容不能超过2000个字符' });
      return;
    }

    // 检查每日发帖限制（每人每天最多20条）
    const todayCount = db.prepare(
      "SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND DATE(created_at) = DATE('now', 'localtime')"
    ).get(req.userId!) as any;

    if (todayCount.count >= 20) {
      res.status(429).json({ error: '今日发帖已达上限（20条）' });
      return;
    }

    const result = db.prepare(
      'INSERT INTO posts (user_id, content, mood) VALUES (?, ?, ?)'
    ).run(req.userId, content.trim(), mood);

    res.json({ id: result.lastInsertRowid, message: '发布成功' });
  } catch (err) {
    console.error('发布帖子失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除自己的帖子
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(id) as any;

    if (!post) {
      res.status(404).json({ error: '帖子不存在' });
      return;
    }

    if (post.user_id !== req.userId) {
      res.status(403).json({ error: '只能删除自己的帖子' });
      return;
    }

    db.prepare('DELETE FROM posts WHERE id = ?').run(id);
    res.json({ message: '删除成功' });
  } catch (err) {
    console.error('删除帖子失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
