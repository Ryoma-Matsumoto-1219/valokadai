window.onload = function() {
  // サーバーから投稿データを取得して表示する関数
  function loadPosts() {
    fetch('/api/posts')
      .then(response => response.json())
      .then(posts => {
        const postsContainer = document.getElementById('posts');
        postsContainer.innerHTML = '';  // 既存の投稿をクリア

        posts.forEach(post => {
          const postElement = document.createElement('div');
          postElement.classList.add('post');

          // 投稿内容に画像が含まれている場合、それも表示
          if (post.text) {
            const textElement = document.createElement('p');
            textElement.textContent = post.text;
            postElement.appendChild(textElement);
          }

          if (post.imageUrl) {
            const img = document.createElement('img');
            img.src = post.imageUrl;
            img.alt = 'Uploaded image';
            img.style.maxWidth = '200px';  // 画像の最大幅を調整
            postElement.appendChild(img);
          }

          postsContainer.appendChild(postElement);
        });
      });
  }

  // 初期表示時にサーバーから投稿を取得
  loadPosts();

  // 画像挿入ボタンがクリックされたときの処理
  document.querySelector('.image-upload-btn').addEventListener('click', function() {
    document.getElementById('image-upload-input').click();  // ファイル選択ダイアログを表示
  });

  let uploadedImageUrl = null;  // アップロードした画像のURLを保存

  // 画像選択後の処理
  document.getElementById('image-upload-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      // 画像をサーバーにアップロード
      fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          console.log('画像アップロード成功:', data);
          uploadedImageUrl = data.imageUrl;  // アップロードした画像URLを保存
        })
        .catch(error => {
          console.error('画像アップロードエラー:', error);
        });
    }
  });

  // 投稿ボタンがクリックされたときの処理
  document.getElementById('post-button').addEventListener('click', function() {
    const input = document.getElementById('post-input');
    const text = input.value.trim();

    if (text || uploadedImageUrl) {
      // サーバーにPOSTリクエストを送る
      fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text, imageUrl: uploadedImageUrl }),
      })
        .then(response => response.json())
        .then(data => {
          console.log(data.message);
          input.value = '';  // 投稿後に入力欄をクリア
          uploadedImageUrl = null;  // アップロードした画像URLをリセット
          loadPosts();  // 投稿後に投稿リストを更新
        })
        .catch(error => {
          console.error('投稿エラー:', error);
        });
    }
  });
};
