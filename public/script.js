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
};
