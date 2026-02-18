const express = require('express');
const session = require('express-session');
const path = require('path');
const { initDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const postRoutes = require('./routes/posts');
const { errorHandler, notFoundHandler, requestLogger } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'mi-secreto-seguro-para-desarrollo',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(requestLogger);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/posts', postRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    initDatabase();
    console.log('Conectado a JSON');
    
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Endpoints disponibles:`);
      console.log(`  GET  /health - Estado del servidor`);
      console.log(`  POST /api/auth/register - Registrar usuario`);
      console.log(`  POST /api/auth/login - Iniciar sesión (recibes JWT)`);
      console.log(`  POST /api/auth/logout - Cerrar sesión`);
      console.log(`  GET  /api/auth/me - Obtener usuario actual`);
      console.log(`  GET  /api/tasks - Listar tareas (requiere JWT)`);
      console.log(`  GET  /api/tasks/:id - Obtener tarea por ID (requiere JWT)`);
      console.log(`  POST /api/tasks - Crear tarea (requiere JWT)`);
      console.log(`  PUT  /api/tasks/:id - Actualizar tarea (requiere JWT)`);
      console.log(`  DELETE /api/tasks/:id - Eliminar tarea (requiere JWT)`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
