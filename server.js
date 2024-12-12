const express = require('express');
const path = require('path');
const multer = require('multer');  // multerのインポート
const fs = require('fs');  // ファイルシステムのモジュール
const app = express();
const port = 3000;

// uploadsディレクトリの確認と作成
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// multerの設定
const upload = multer({
  dest: 'public/uploads/',  // 画像の保存先ディレクトリ（public内に保存）
  limits: { fileSize: 5 * 1024 * 1024 },  // 最大ファイルサイズ5MB
});

// ミドルウェア設定
app.use(express.static(path.join(__dirname, 'public')));  // 公開フォルダ（public）に静的ファイルを置く
app.use(express.json());  // POSTリクエストでJSONをパース

// スレッドデータの保存用（簡単に配列を使う例）
let threads = [];
let posts = [];  // 投稿は後でスレッドごとに管理します

// GETリクエストで掲示板のスレッドを取得する
app.get('/api/threads', (req, res) => {
  res.json(threads);
});

// POSTリクエストで新しいスレッドを作成する
app.post('/api/threads', (req, res) => {
  const { title } = req.body;
  if (title) {
    const newThread = { id: threads.length + 1, title: title };
    threads.push(newThread);
    res.status(201).json(newThread);  // 作成したスレッドを返す
  } else {
    res.status(400).json({ message: 'スレッドタイトルが必要です' });
  }
});

// GETリクエストでスレッドに関連する投稿を取得する
app.get('/api/posts', (req, res) => {
  const { threadId } = req.query;
  if (threadId) {
    const threadPosts = posts.filter(post => post.threadId === parseInt(threadId));
    res.json(threadPosts);
  } else {
    res.status(400).json({ message: 'スレッドIDが必要です' });
  }
});

// POSTリクエストで新しい投稿を受け取る（スレッドIDを指定して投稿）
app.post('/api/posts', (req, res) => {
  let { text, imageUrl, threadId } = req.body;
  if (threadId && (text || imageUrl)) {
    threadId = parseInt(threadId)
    const newPost = { text, imageUrl, threadId };
    posts.push(newPost);
    res.status(201).json(newPost);  // 作成した投稿を返す
  } else {
    res.status(400).json({ message: 'スレッドIDと投稿内容が必要です' });
  }
});

// 画像アップロードのエンドポイント
app.post('/api/upload', upload.single('image'), (req, res) => {
  // 画像が選ばれていない場合
  if (!req.file) {
    return res.status(400).json({ message: '画像が選択されていません' });
  }

  // アップロードした画像のURLを返す
  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl: imageUrl });
});

// サーバーの開始($ npm run devと打てばいける)
app.listen(port, () => {
  console.log(`サーバーがポート${port}で起動しました。`);
});
