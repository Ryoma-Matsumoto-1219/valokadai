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

// 投稿データの保存用（簡単に配列を使う例）
let posts = [];

// GETリクエストで掲示板の投稿を取得する
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

// POSTリクエストで新しい投稿を受け取る
app.post('/api/posts', (req, res) => {
  const newPost = req.body.text;
  const imageUrl = req.body.imageUrl;
  if (newPost || imageUrl) {
    const post = { text: newPost, imageUrl: imageUrl }; // 投稿に画像URLも追加
    posts.push(post);
    res.status(201).json({ message: '投稿が成功しました' });
  } else {
    res.status(400).json({ message: '投稿が空です' });
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
