window.onload = function() {
  // サーバーからスレッドデータを取得して表示する関数
  function loadThreads() {
    fetch('/api/threads')
      .then(response => response.json())
      .then(threads => {
        const threadsContainer = document.getElementById('threads');
        threadsContainer.innerHTML = '';  // 既存のスレッドをクリア

        threads.forEach(thread => {
          const threadElement = document.createElement('div');
          threadElement.classList.add('thread');
          threadElement.textContent = thread.title;
          threadElement.dataset.id = thread.id;  // スレッドIDをdata属性に追加
          threadElement.addEventListener('click', function() {
            loadPosts(thread.id);  // スレッド選択時に投稿を読み込む
            selectThread(threadElement);  // スレッド選択時に視覚的に反映
          });
          threadsContainer.appendChild(threadElement);
        });
      })
      .catch(error => console.error('スレッド読み込みエラー:', error));
  }

  // サーバーから投稿データを取得して表示する関数
  function loadPosts(threadId) {
    fetch(`/api/posts?threadId=${threadId}`)
      .then(response => response.json())
      .then(posts => {
        const postsContainer = document.getElementById('posts');
        postsContainer.innerHTML = '';  // 既存の投稿をクリア

        posts.forEach((post, index) => {
          const postElement = document.createElement('div');
          postElement.classList.add('post');

          // 番号と投稿時間を同じ行に表示するための親要素
          const postInfoElement = document.createElement('div');
          postInfoElement.classList.add('post-info');

          // 番号を表示 (投稿された順番: #1, #2, #3...)
          const postNumberElement = document.createElement('span');
          postNumberElement.classList.add('post-number');
          postNumberElement.textContent = `#${index + 1}`;  // 1から始めるためにindex + 1
          postInfoElement.appendChild(postNumberElement); // 番号を先頭に追加

          // 投稿時間を表示
          const postTimeElement = document.createElement('span');
          postTimeElement.classList.add('post-time');
          postTimeElement.textContent = new Date(post.postTime).toLocaleString();  // ローカルな時間形式に変換
          postInfoElement.appendChild(postTimeElement); // 投稿時間を追加

          postElement.appendChild(postInfoElement); // 番号と時間をまとめた親要素を追加

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
      })
      .catch(error => console.error('投稿読み込みエラー:', error));
  }

  // スレッド作成ボタンがクリックされたときの処理
  document.getElementById('create-thread-button').addEventListener('click', function() {
    const title = document.getElementById('thread-title').value.trim();
    if (title) {
      fetch('/api/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title }),
      })
      .then(response => response.json())
      .then(data => {
        loadThreads(); // スレッド作成後にスレッドリストを更新
        document.getElementById('thread-title').value = ''; // フォームをクリア
      })
      .catch(error => console.error('スレッド作成エラー:', error));
    }
  });

  // スレッド選択時に視覚的に反映
  function selectThread(threadElement) {
    const allThreads = document.querySelectorAll('.thread');
    allThreads.forEach(thread => {
      thread.classList.remove('active');
    });
    threadElement.classList.add('active');
  }

  // 初期表示でスレッドをロード
  loadThreads();

  // 画像挿入ボタンがクリックされたときの処理
  document.querySelector('.image-upload-btn').addEventListener('click', function() {
    document.getElementById('image-upload-input').click();  // ファイル選択ダイアログを表示
  });

  let uploadedImageUrl = null;  // アップロードした画像のURLを保存

  // 画像選択後の処理
  document.getElementById('image-upload-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      const imagePreviewContainer = document.getElementById('image-preview-container');
      const imagePreview = document.createElement('img');
      imagePreview.src = URL.createObjectURL(file);  // 選択された画像のURLをプレビューとして表示
      imagePreview.alt = 'Image Preview';
      imagePreview.style.maxWidth = '200px';  // プレビュー画像の最大幅を調整
      imagePreviewContainer.innerHTML = '';  // 以前のプレビューをクリア
      imagePreviewContainer.appendChild(imagePreview);  // 新しいプレビューを表示

      // キャンセルボタンを表示
      const cancelButton = document.getElementById('cancel-upload');
      cancelButton.style.display = 'inline-block';  // キャンセルボタンを表示

      // キャンセルボタンの処理
      cancelButton.addEventListener('click', function() {
        imagePreviewContainer.innerHTML = '';  // 画像プレビューを削除
        document.getElementById('image-upload-input').value = '';  // ファイル選択をリセット
        cancelButton.style.display = 'none';  // キャンセルボタンを非表示
      });

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
    const threadId = document.querySelector('.thread.active') ? document.querySelector('.thread.active').dataset.id : null;

    if (text || uploadedImageUrl) {
      // サーバーにPOSTリクエストを送る
      fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text, imageUrl: uploadedImageUrl, threadId: threadId }),
      })
        .then(response => response.json())
        .then(data => {
          console.log(data.message);
          input.value = '';  // 投稿後に入力欄をクリア
          uploadedImageUrl = null;  // アップロードした画像URLをリセット
          loadPosts(threadId);  // 投稿後に選択されているスレッドの投稿を再読み込み
        })
        .catch(error => {
          console.error('投稿エラー:', error);
        });
    }
  });

  // スレッド表示/非表示ボタンの処理
  document.getElementById('toggle-threads').addEventListener('click', function() {
    const threadsContainer = document.getElementById('threads');
    
    // スレッド一覧が表示されていれば非表示に、非表示なら表示する
    if (threadsContainer.style.display === 'none') {
      threadsContainer.style.display = 'block'; // スレッド一覧を表示
    } else {
      threadsContainer.style.display = 'none'; // スレッド一覧を非表示
    }
  });

  // Enterキーでスレッド作成
  document.getElementById('thread-title').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();  // Enterキーのデフォルト動作を無効化
      document.getElementById('create-thread-button').click();  // スレッド作成ボタンをクリック
    }
  });

  // Enterキーで投稿
  document.getElementById('post-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();  // Enterキーのデフォルト動作を無効化
      document.getElementById('post-button').click();  // 投稿ボタンをクリック
    }
  });
};

