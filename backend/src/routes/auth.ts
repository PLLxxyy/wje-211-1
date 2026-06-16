import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db';
import { signToken } from '../middleware/auth';

const router = Router();

// 注册
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: '用户名和密码不能为空' });
      return;
    }

    if (username.length < 2 || username.length > 20) {
      res.status(400).json({ error: '用户名长度需要在2-20个字符之间' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: '密码长度不能少于6个字符' });
      return;
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      res.status(400).json({ error: '该用户名已被注册' });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashed);

    const token = signToken(result.lastInsertRowid as number, 'user');
    res.json({ token, message: '注册成功' });
  } catch (err) {
    console.error('注册失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: '用户名和密码不能为空' });
      return;
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    if (!user) {
      res.status(401).json({ error: '用户名或密码错误' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: '用户名或密码错误' });
      return;
    }

    const token = signToken(user.id, user.role);
    res.json({ token, message: '登录成功' });
  } catch (err) {
    console.error('登录失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取当前用户信息
router.get('/me', (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header) {
    res.status(401).json({ error: '未登录' });
    return;
  }

  try {
    const jwt = require('jsonwebtoken');
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'confession-wall-secret-key-2024') as any;
    const user = db.prepare('SELECT id, username, role, created_at FROM users WHERE id = ?').get(payload.userId);
    if (!user) {
      res.status(401).json({ error: '用户不存在' });
      return;
    }
    res.json(user);
  } catch {
    res.status(401).json({ error: '登录已过期' });
  }
});

export default router;
