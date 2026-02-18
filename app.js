const API_URL = 'http://localhost:3002/api';

let token = localStorage.getItem('token');

const authSection = document.getElementById('authSection');
const tasksSection = document.getElementById('tasksSection');
const logoutBtn = document.getElementById('logoutBtn');
const tasksList = document.getElementById('tasksList');
const taskForm = document.getElementById('taskForm');
const pendingCount = document.getElementById('pendingCount');
const completedCount = document.getElementById('completedCount');

const tabs = document.querySelectorAll('.tab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

function init() {
  if (token) {
    showTasks();
    loadTasks();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
  logoutBtn.addEventListener('click', handleLogout);
  taskForm.addEventListener('submit', handleAddTask);
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
    showTasks();
    loadTasks();
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
  tasksSection.classList.add('hidden');
  logoutBtn.classList.add('hidden');
  loginForm.reset();
  registerForm.reset();
}

function showTasks() {
  authSection.classList.add('hidden');
  tasksSection.classList.remove('hidden');
  logoutBtn.classList.remove('hidden');
}

async function loadTasks() {
  try {
    const res = await fetch(`${API_URL}/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 401) {
      handleLogout();
      return;
    }

    const data = await res.json();
    renderTasks(data.tasks);
  } catch (err) {
    console.error('Error cargando tareas:', err);
  }
}

function renderTasks(tasks) {
  tasksList.innerHTML = '';
  const pending = tasks.filter(t => !t.completed).length;
  const completed = tasks.filter(t => t.completed).length;
  pendingCount.textContent = `${pending} pendiente${pending !== 1 ? 's' : ''}`;
  completedCount.textContent = `${completed} completada${completed !== 1 ? 's' : ''}`;

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item${task.completed ? ' completed' : ''}`;
    li.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
      <div class="task-content">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
      </div>
      <div class="task-actions">
        <button class="btn-delete" data-id="${task.id}">Eliminar</button>
      </div>
    `;

    const checkbox = li.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => toggleTask(task.id, checkbox.checked));

    const deleteBtn = li.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    tasksList.appendChild(li);
  });
}

async function handleAddTask(e) {
  e.preventDefault();
  const title = document.getElementById('taskTitle').value;
  const description = document.getElementById('taskDescription').value;

  try {
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, description })
    });

    if (res.ok) {
      document.getElementById('taskTitle').value = '';
      document.getElementById('taskDescription').value = '';
      loadTasks();
    }
  } catch (err) {
    console.error('Error agregando tarea:', err);
  }
}

async function toggleTask(id, completed) {
  try {
    await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ completed })
    });
    loadTasks();
  } catch (err) {
    console.error('Error actualizando tarea:', err);
  }
}

async function deleteTask(id) {
  try {
    await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    loadTasks();
  } catch (err) {
    console.error('Error eliminando tarea:', err);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

init();
