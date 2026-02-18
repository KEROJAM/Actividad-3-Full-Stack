const API_URL = 'http://localhost:3002/api';

let token = localStorage.getItem('token');

const authSection = document.getElementById('authSection');
const forumSection = document.getElementById('forumSection');
const logoutBtn = document.getElementById('logoutBtn');
const postsList = document.getElementById('postsList');
const postsCount = document.getElementById('postsCount');
const postDetail = document.getElementById('postDetail');
const postContentView = document.getElementById('postContentView');
const commentsList = document.getElementById('commentsList');
const backBtn = document.getElementById('backBtn');

const tabs = document.querySelectorAll('.tab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

let currentPostId = null;

function init() {
  if (token) {
    showForum();
    loadPosts();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
  logoutBtn.addEventListener('click', handleLogout);
  document.getElementById('postForm').addEventListener('submit', handleCreatePost);
  document.getElementById('commentForm').addEventListener('submit', handleAddComment);
  backBtn.addEventListener('click', () => {
    postDetail.classList.add('hidden');
    postsList.classList.remove('hidden');
    document.getElementById('newPostForm').classList.remove('hidden');
    currentPostId = null;
  });
}

function switchTab(tabName) {
  tabs.forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  if (tabName === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
  }
}

function showError(message) {
  const existing = document.querySelector('.error-msg');
  if (existing) existing.remove();

  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-msg';
  errorDiv.textContent = message;
  authSection.insertBefore(errorDiv, authSection.firstChild);
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error);
      return;
    }

    token = data.token;
    localStorage.setItem('token', token);
    showForum();
    loadPosts();
  } catch (err) {
    showError('Error de conexión');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error);
      return;
    }

    switchTab('login');
    document.getElementById('loginUsername').value = username;
    document.getElementById('loginPassword').value = password;
  } catch (err) {
    showError('Error de conexión');
  }
}

function handleLogout() {
  token = null;
  localStorage.removeItem('token');
  authSection.classList.remove('hidden');
  forumSection.classList.add('hidden');
  logoutBtn.classList.add('hidden');
  loginForm.reset();
  registerForm.reset();
}

function showForum() {
  authSection.classList.add('hidden');
  forumSection.classList.remove('hidden');
  logoutBtn.classList.remove('hidden');
}

async function loadPosts() {
  try {
    const res = await fetch(`${API_URL}/posts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 401) {
      handleLogout();
      return;
    }

    const data = await res.json();
    renderPosts(data.posts);
  } catch (err) {
    console.error('Error cargando publicaciones:', err);
  }
}

function renderPosts(posts) {
  postsList.innerHTML = '';
  postsCount.textContent = `${posts.length} publicacion${posts.length !== 1 ? 'es' : ''}`;

  posts.forEach(post => {
    const div = document.createElement('div');
    div.className = 'post-item';
    div.innerHTML = `
      <div class="post-header">
        <span class="post-author">${escapeHtml(post.author)}</span>
        <span class="post-date">${formatDate(post.created_at)}</span>
      </div>
      <div class="post-title">${escapeHtml(post.title)}</div>
      <div class="post-preview">${escapeHtml(post.content.substring(0, 150))}${post.content.length > 150 ? '...' : ''}</div>
      <div class="post-meta">
        <span class="comment-count">${post.comment_count || 0} comentario${(post.comment_count || 0) !== 1 ? 's' : ''}</span>
      </div>
    `;

    div.addEventListener('click', () => viewPost(post.id));
    postsList.appendChild(div);
  });
}

async function handleCreatePost(e) {
  e.preventDefault();
  const title = document.getElementById('postTitle').value;
  const content = document.getElementById('postContent').value;

  if (!title.trim() || !content.trim()) return;

  try {
    const res = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, content })
    });

    if (res.ok) {
      document.getElementById('postTitle').value = '';
      document.getElementById('postContent').value = '';
      loadPosts();
    }
  } catch (err) {
    console.error('Error creando publicación:', err);
  }
}

async function viewPost(postId) {
  currentPostId = postId;
  postsList.classList.add('hidden');
  document.getElementById('newPostForm').classList.add('hidden');
  postDetail.classList.remove('hidden');

  try {
    const res = await fetch(`${API_URL}/posts/${postId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    
    postContentView.innerHTML = `
      <div class="post-full-header">
        <span class="post-author">${escapeHtml(data.post.author)}</span>
        <span class="post-date">${formatDate(data.post.created_at)}</span>
      </div>
      <h2 class="post-full-title">${escapeHtml(data.post.title)}</h2>
      <div class="post-full-content">${escapeHtml(data.post.content)}</div>
    `;

    renderComments(data.comments || []);
  } catch (err) {
    console.error('Error cargando publicación:', err);
  }
}

function renderComments(comments) {
  commentsList.innerHTML = '';

  if (comments.length === 0) {
    commentsList.innerHTML = '<p class="no-comments">No hay comentarios aún</p>';
    return;
  }

  comments.forEach(comment => {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.innerHTML = `
      <div class="comment-header">
        <span class="comment-author">${escapeHtml(comment.author)}</span>
        <span class="comment-date">${formatDate(comment.created_at)}</span>
      </div>
      <div class="comment-content">${escapeHtml(comment.content)}</div>
    `;
    commentsList.appendChild(div);
  });
}

async function handleAddComment(e) {
  e.preventDefault();
  const content = document.getElementById('commentText').value;

  if (!content.trim() || !currentPostId) return;

  try {
    const res = await fetch(`${API_URL}/posts/${currentPostId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });

    if (res.ok) {
      document.getElementById('commentText').value = '';
      viewPost(currentPostId);
    }
  } catch (err) {
    console.error('Error agregando comentario:', err);
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

init();
