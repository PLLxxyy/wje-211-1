# 匿名树洞 (Anonymous Confession Wall)

一个匿名发帖的心情分享平台，用户注册登录后以匿名身份在树洞中发帖、点赞、评论。

## 功能特性

- **用户注册/登录** - 账号信息不会显示在帖子中
- **匿名发帖** - 选择情绪标签（开心/烦恼/吐槽/表白/许愿）发布心情文字
- **瀑布流首页** - 展示所有匿名帖子，支持点赞和匿名评论
- **今日热帖** - 按点赞数每日排行
- **个人中心** - 仅自己可见"我的帖子"
- **管理员功能** - 可删除违规内容
- **每日统计** - 查看每日发帖数统计

## 技术栈

- **前端**: Vite + React 18 + TypeScript (port 5211)
- **后端**: Express + TypeScript + better-sqlite3 (port 3211)
- **认证**: JWT + bcryptjs
- **数据库**: SQLite (better-sqlite3)

## 快速开始

```bash
npm run install:all && npm run seed && npm run dev
```

- 前端: http://localhost:5211
- 后端: http://localhost:3211

## 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 普通用户 | user1 | 123456 |
| 普通用户 | user2 | 123456 |
| 管理员 | admin | admin123 |

## 项目结构

```
wje-211/
├── package.json          # 根配置，定义 install:all、seed、dev 命令
├── README.md
├── backend/              # Express 后端
│   ├── package.json
│   ├── tsconfig.json
│   ├── seed.ts           # 种子数据
│   └── src/
│       ├── index.ts      # 入口文件
│       ├── db.ts         # 数据库初始化
│       ├── middleware/
│       │   └── auth.ts   # JWT 认证中间件
│       └── routes/
│           ├── auth.ts   # 注册/登录
│           ├── posts.ts  # 帖子 CRUD
│           ├── comments.ts
│           ├── likes.ts
│           ├── admin.ts  # 管理员操作
│           └── stats.ts  # 统计
└── frontend/             # React 前端
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html        # 包含所有样式
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── api/
        │   ├── client.ts
        │   └── types.ts
        ├── pages/
        │   ├── LoginPage.tsx
        │   ├── RegisterPage.tsx
        │   ├── HomePage.tsx
        │   ├── PostDetailPage.tsx
        │   ├── CreatePostPage.tsx
        │   ├── ProfilePage.tsx
        │   └── StatsPage.tsx
        └── components/
            └── Navbar.tsx
```
