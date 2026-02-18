const { v4: uuidv4 } = require('uuid');
const { getTasks, saveTasks } = require('../config/database');

function getAllTasks(userId) {
  const data = getTasks();
  return data.tasks
    .filter(task => task.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getTaskById(id, userId) {
  const data = getTasks();
  const task = data.tasks.find(t => t.id === id && t.userId === userId);
  return task || null;
}

function createTask(title, description, userId) {
  const data = getTasks();
  const now = new Date().toISOString();
  
  const newTask = {
    id: uuidv4(),
    title,
    description: description || '',
    completed: false,
    userId,
    createdAt: now,
    updatedAt: now
  };

  data.tasks.push(newTask);
  saveTasks(data);
  
  return newTask;
}

function updateTask(id, updates, userId) {
  const data = getTasks();
  const taskIndex = data.tasks.findIndex(t => t.id === id && t.userId === userId);
  
  if (taskIndex === -1) {
    return null;
  }

  const allowedUpdates = ['title', 'description', 'completed'];
  
  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      data.tasks[taskIndex][key] = updates[key];
    }
  }
  
  data.tasks[taskIndex].updatedAt = new Date().toISOString();
  saveTasks(data);
  
  return data.tasks[taskIndex];
}

function deleteTask(id, userId) {
  const data = getTasks();
  const initialLength = data.tasks.length;
  
  data.tasks = data.tasks.filter(t => !(t.id === id && t.userId === userId));
  
  if (data.tasks.length === initialLength) {
    return false;
  }

  saveTasks(data);
  return true;
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
