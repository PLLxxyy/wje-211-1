import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(__dirname, 'data.db');

// 删除旧数据库
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('已删除旧数据库');
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 创建表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    mood TEXT NOT NULL CHECK(mood IN ('开心', '烦恼', '吐槽', '表白', '许愿')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
  CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
  CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
`);

async function seed() {
  console.log('开始创建种子数据...');

  // 创建用户
  const hash = await bcrypt.hash('123456', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  const insertUser = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
  const user1 = insertUser.run('user1', hash, 'user');
  const user2 = insertUser.run('user2', hash, 'user');
  const user3 = insertUser.run('user3', hash, 'user');
  const user4 = insertUser.run('user4', hash, 'user');
  const user5 = insertUser.run('user5', hash, 'user');
  const admin = insertUser.run('admin', adminHash, 'admin');

  console.log('已创建6个用户（含1个管理员）');

  // 创建帖子
  const insertPost = db.prepare('INSERT INTO posts (user_id, content, mood, created_at) VALUES (?, ?, ?, ?)');
  const posts = [
    { userId: user1.lastInsertRowid, content: '今天终于把困扰了我一个月的bug修掉了，开心到飞起！程序员的快乐就是这么简单。', mood: '开心', date: '2026-06-14 09:30:00' },
    { userId: user2.lastInsertRowid, content: '刚毕业找工作好难啊，投了几十份简历都没有回音，开始怀疑自己的能力了...', mood: '烦恼', date: '2026-06-14 10:15:00' },
    { userId: user3.lastInsertRowid, content: '公司的加班文化真的让人窒息，明明工作都做完了，领导不走谁都不敢走。', mood: '吐槽', date: '2026-06-14 11:00:00' },
    { userId: user4.lastInsertRowid, content: '偷偷喜欢你很久了，每次看到你笑我心情就会变好。虽然你可能永远不知道，但这份喜欢是真的。', mood: '表白', date: '2026-06-14 12:30:00' },
    { userId: user5.lastInsertRowid, content: '许个愿：希望今年能存够钱去一次日本旅行，想看樱花和富士山。', mood: '许愿', date: '2026-06-14 13:00:00' },
    { userId: user1.lastInsertRowid, content: '周末和朋友去爬山了，虽然很累但山顶的风景真的太美了！大自然是最好的治愈。', mood: '开心', date: '2026-06-14 14:30:00' },
    { userId: user2.lastInsertRowid, content: '室友半夜打游戏开语音到凌晨三点，第二天还要早起上班，真的要疯了。', mood: '吐槽', date: '2026-06-14 15:00:00' },
    { userId: user3.lastInsertRowid, content: '下个月就要考研了，复习进度严重落后，焦虑到睡不着觉。', mood: '烦恼', date: '2026-06-14 16:00:00' },
    { userId: user4.lastInsertRowid, content: '今天收到了一个陌生人的善意，地铁上有人给我让座，心情突然好了一整天。', mood: '开心', date: '2026-06-14 17:30:00' },
    { userId: user5.lastInsertRowid, content: '许愿：希望家人身体健康，平安喜乐。这是最重要的事。', mood: '许愿', date: '2026-06-14 18:00:00' },
    { userId: user1.lastInsertRowid, content: '终于鼓起勇气跟暗恋了三年的人表白了，虽然被拒绝了，但至少不会留遗憾了。', mood: '表白', date: '2026-06-15 08:00:00' },
    { userId: user2.lastInsertRowid, content: '养了两年的猫猫今天会自己开门了，又骄傲又无奈，以后再也没隐私了。', mood: '开心', date: '2026-06-15 09:00:00' },
    { userId: user3.lastInsertRowid, content: '相亲对象全程玩手机，连我叫什么名字都没记住。以后再也不去了。', mood: '吐槽', date: '2026-06-15 10:00:00' },
    { userId: user4.lastInsertRowid, content: '房租又涨了，工资却一分没涨。这个城市到底还让不让人活了。', mood: '烦恼', date: '2026-06-15 11:00:00' },
    { userId: user5.lastInsertRowid, content: '许个愿：希望下个月的考试能顺利通过，已经准备了三个月了。', mood: '许愿', date: '2026-06-15 12:00:00' },
    { userId: user1.lastInsertRowid, content: '今天做了人生第一顿饭给爸妈吃，虽然卖相不好但他们说很好吃，眼眶湿了。', mood: '开心', date: '2026-06-15 13:00:00' },
    { userId: user3.lastInsertRowid, content: '隔壁装修已经持续两个月了，电钻声从早到晚，周末都不让人休息。', mood: '吐槽', date: '2026-06-15 14:00:00' },
    { userId: user4.lastInsertRowid, content: '你身上有光，我偷偷看了好多年。希望你一切都好，即使和我无关。', mood: '表白', date: '2026-06-15 15:00:00' },
    { userId: user5.lastInsertRowid, content: '今天抢到了演唱会的票！期待了半年终于如愿以偿！', mood: '开心', date: '2026-06-15 16:00:00' },
    { userId: user2.lastInsertRowid, content: '如果可以重来，我一定不会选这个专业。四年青春就这么浪费了。', mood: '烦恼', date: '2026-06-15 17:00:00' },
  ];

  const postIds: any[] = [];
  for (const p of posts) {
    const result = insertPost.run(p.userId, p.content, p.mood, p.date);
    postIds.push(result.lastInsertRowid);
  }

  console.log(`已创建${posts.length}条帖子`);

  // 创建点赞
  const insertLike = db.prepare('INSERT INTO likes (post_id, user_id, created_at) VALUES (?, ?, ?)');
  const allUsers = [user1.lastInsertRowid, user2.lastInsertRowid, user3.lastInsertRowid, user4.lastInsertRowid, user5.lastInsertRowid];

  // 给帖子随机点赞
  const likeData: [any, any, string][] = [
    [postIds[0], user2.lastInsertRowid, '2026-06-14 10:00:00'],
    [postIds[0], user3.lastInsertRowid, '2026-06-14 10:05:00'],
    [postIds[0], user4.lastInsertRowid, '2026-06-14 10:10:00'],
    [postIds[0], user5.lastInsertRowid, '2026-06-14 10:20:00'],
    [postIds[1], user1.lastInsertRowid, '2026-06-14 11:00:00'],
    [postIds[1], user3.lastInsertRowid, '2026-06-14 11:30:00'],
    [postIds[2], user1.lastInsertRowid, '2026-06-14 12:00:00'],
    [postIds[2], user2.lastInsertRowid, '2026-06-14 12:10:00'],
    [postIds[2], user4.lastInsertRowid, '2026-06-14 12:15:00'],
    [postIds[2], user5.lastInsertRowid, '2026-06-14 12:20:00'],
    [postIds[2], admin.lastInsertRowid, '2026-06-14 12:25:00'],
    [postIds[3], user1.lastInsertRowid, '2026-06-14 13:00:00'],
    [postIds[3], user2.lastInsertRowid, '2026-06-14 13:10:00'],
    [postIds[3], user3.lastInsertRowid, '2026-06-14 13:15:00'],
    [postIds[4], user1.lastInsertRowid, '2026-06-14 14:00:00'],
    [postIds[4], user2.lastInsertRowid, '2026-06-14 14:05:00'],
    [postIds[4], user3.lastInsertRowid, '2026-06-14 14:10:00'],
    [postIds[5], user2.lastInsertRowid, '2026-06-14 15:00:00'],
    [postIds[5], user3.lastInsertRowid, '2026-06-14 15:05:00'],
    [postIds[5], user4.lastInsertRowid, '2026-06-14 15:10:00'],
    [postIds[5], user5.lastInsertRowid, '2026-06-14 15:15:00'],
    [postIds[5], admin.lastInsertRowid, '2026-06-14 15:20:00'],
    [postIds[6], user1.lastInsertRowid, '2026-06-14 16:00:00'],
    [postIds[6], user3.lastInsertRowid, '2026-06-14 16:05:00'],
    [postIds[6], user5.lastInsertRowid, '2026-06-14 16:10:00'],
    [postIds[7], user1.lastInsertRowid, '2026-06-14 17:00:00'],
    [postIds[8], user2.lastInsertRowid, '2026-06-14 18:00:00'],
    [postIds[8], user3.lastInsertRowid, '2026-06-14 18:05:00'],
    [postIds[8], user5.lastInsertRowid, '2026-06-14 18:10:00'],
    [postIds[8], admin.lastInsertRowid, '2026-06-14 18:15:00'],
    [postIds[10], user2.lastInsertRowid, '2026-06-15 09:00:00'],
    [postIds[10], user3.lastInsertRowid, '2026-06-15 09:05:00'],
    [postIds[10], user5.lastInsertRowid, '2026-06-15 09:10:00'],
    [postIds[11], user1.lastInsertRowid, '2026-06-15 10:00:00'],
    [postIds[11], user3.lastInsertRowid, '2026-06-15 10:05:00'],
    [postIds[11], user4.lastInsertRowid, '2026-06-15 10:10:00'],
    [postIds[18], user1.lastInsertRowid, '2026-06-15 17:00:00'],
    [postIds[18], user2.lastInsertRowid, '2026-06-15 17:05:00'],
    [postIds[18], user3.lastInsertRowid, '2026-06-15 17:10:00'],
    [postIds[18], user4.lastInsertRowid, '2026-06-15 17:15:00'],
  ];

  for (const [postId, userId, date] of likeData) {
    insertLike.run(postId, userId, date);
  }

  console.log(`已创建${likeData.length}个点赞`);

  // 创建评论
  const insertComment = db.prepare('INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)');
  const commentData: [any, any, string, string][] = [
    [postIds[0], user2.lastInsertRowid, '恭喜恭喜！修完bug的成就感真的太棒了', '2026-06-14 10:00:00'],
    [postIds[0], user3.lastInsertRowid, '同感！有时候一个bug能折磨人好几天', '2026-06-14 10:30:00'],
    [postIds[1], user4.lastInsertRowid, '别灰心，第一份工作都是最难找的，加油！', '2026-06-14 11:00:00'],
    [postIds[1], user5.lastInsertRowid, '建议多修改简历，针对不同岗位定制会好很多', '2026-06-14 11:30:00'],
    [postIds[2], user1.lastInsertRowid, '这种公司文化真的太压抑了，考虑换一个吧', '2026-06-14 12:00:00'],
    [postIds[3], user5.lastInsertRowid, '好浪漫的暗恋，祝你幸福', '2026-06-14 13:00:00'],
    [postIds[5], user2.lastInsertRowid, '爬山真的超解压！推荐去武功山', '2026-06-14 15:00:00'],
    [postIds[7], user4.lastInsertRowid, '考研加油！坚持就是胜利', '2026-06-14 17:00:00'],
    [postIds[10], user3.lastInsertRowid, '勇敢的人最美！拒绝了也没关系的', '2026-06-15 09:00:00'],
    [postIds[11], user1.lastInsertRowid, '哈哈哈太可爱了，猫猫开门可还行', '2026-06-15 10:00:00'],
    [postIds[13], user5.lastInsertRowid, '房租真的太离谱了，打工人的悲哀', '2026-06-15 12:00:00'],
    [postIds[18], user1.lastInsertRowid, '恭喜抢到票！什么演唱会？', '2026-06-15 17:00:00'],
  ];

  for (const [postId, userId, content, date] of commentData) {
    insertComment.run(postId, userId, content, date);
  }

  console.log(`已创建${commentData.length}条评论`);
  console.log('\n种子数据创建完成！');
  console.log('================================');
  console.log('测试账号:');
  console.log('  普通用户: user1 / 123456');
  console.log('  普通用户: user2 / 123456');
  console.log('  普通用户: user3 / 123456');
  console.log('  普通用户: user4 / 123456');
  console.log('  普通用户: user5 / 123456');
  console.log('  管理员:   admin / admin123');
  console.log('================================');

  db.close();
}

seed().catch(console.error);
