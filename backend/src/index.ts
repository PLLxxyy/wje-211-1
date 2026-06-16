import express from 'express';
import cors from 'cors';
import { initDb } from './db';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import commentRoutes from './routes/comments';
import likeRoutes from './routes/likes';
import favoriteRoutes from './routes/favorites';
import adminRoutes from './routes/admin';
import statsRoutes from './routes/stats';

const app = express();
const PORT = Number(process.env.PORT) || 3211;

// 初始化数据库
initDb();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: '匿名树洞服务运行中' });
});

app.listen(PORT, () => {
  console.log(`匿名树洞后端服务已启动: http://localhost:${PORT}`);
});
