const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getUsers, saveUsers } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'mi-secreto-jwt-para-desarrollo';
const JWT_EXPIRES_IN = '24h';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function findUserByUsername(username) {
  const data = getUsers();
  const user = data.users.find(u => u.username === username);
  return user || null;
}

function findUserById(id) {
  const data = getUsers();
  const user = data.users.find(u => u.id === id);
  if (!user) return null;
  
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt
  };
}

async function createUser(username, password) {
  const existingUser = findUserByUsername(username);
  if (existingUser) {
    throw new Error('El usuario ya existe');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = uuidv4();
  const createdAt = new Date().toISOString();

  const data = getUsers();
  data.users.push({
    id,
    username,
    password: hashedPassword,
    createdAt
  });
  saveUsers(data);

  return { id, username, createdAt };
}

async function validatePassword(user, password) {
  return bcrypt.compare(password, user.password);
}

function createToken(user) {
  return generateToken(user);
}

module.exports = {
  findUserByUsername,
  findUserById,
  createUser,
  validatePassword,
  createToken
};
