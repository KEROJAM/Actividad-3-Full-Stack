const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

const usersFile = path.join(dataDir, 'users.json');
const tasksFile = path.join(dataDir, 'tasks.json');
const postsFile = path.join(dataDir, 'posts.json');
const commentsFile = path.join(dataDir, 'comments.json');

function readJSON(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getUsers() {
  return readJSON(usersFile);
}

function saveUsers(data) {
  writeJSON(usersFile, data);
}

function getTasks() {
  return readJSON(tasksFile);
}

function saveTasks(data) {
  writeJSON(tasksFile, data);
}

function getPosts() {
  return readJSON(postsFile);
}

function savePosts(data) {
  writeJSON(postsFile, data);
}

function getComments() {
  return readJSON(commentsFile);
}

function saveComments(data) {
  writeJSON(commentsFile, data);
}

function initDatabase() {
  console.log('Base de datos JSON inicializada');
}

module.exports = {
  getUsers,
  saveUsers,
  getTasks,
  saveTasks,
  getPosts,
  savePosts,
  getComments,
  saveComments,
  initDatabase
};
