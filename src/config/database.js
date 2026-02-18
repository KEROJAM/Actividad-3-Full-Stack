const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

const usersFile = path.join(dataDir, 'users.json');
const tasksFile = path.join(dataDir, 'tasks.json');

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

function initDatabase() {
  console.log('Base de datos JSON inicializada');
}

module.exports = {
  getUsers,
  saveUsers,
  getTasks,
  saveTasks,
  initDatabase
};
