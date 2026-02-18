# Documentación de la API de Tareas (To-Do List)

## 1. Estructura del Proyecto

```
api-tareas/
├── src/
│   ├── config/
│   │   └── database.js       # Configuración de MySQL
│   ├── middleware/
│   │   ├── authenticate.js   # Middleware de autenticación JWT
│   │   ├── errorHandler.js   # Manejo de errores
│   │   └── validation.js     # Validación de datos
│   ├── routes/
│   │   ├── auth.js           # Rutas de autenticación
│   │   └── tasks.js          # Rutas de tareas
│   ├── services/
│   │   ├── taskService.js    # Lógica de tareas
│   │   └── userService.js    # Lógica de usuarios
│   └── server.js             # Punto de entrada del servidor
├── index.html                # Frontend
├── styles.css                # Estilos
├── app.js                    # Lógica del frontend
├── package.json
└── README.md
```

---

## 2. Rutas de la API

### 2.1 Autenticación

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | /api/auth/register | Registrar nuevo usuario | No |
| POST | /api/auth/login | Iniciar sesión (retorna JWT) | No |
| POST | /api/auth/logout | Cerrar sesión | Sí (JWT) |
| GET | /api/auth/me | Obtener usuario actual | Sí (JWT) |

### 2.2 Tareas

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/tasks | Listar todas las tareas del usuario | Sí (JWT) |
| GET | /api/tasks/:id | Obtener tarea por ID | Sí (JWT) |
| POST | /api/tasks | Crear nueva tarea | Sí (JWT) |
| PUT | /api/tasks/:id | Actualizar tarea | Sí (JWT) |
| DELETE | /api/tasks/:id | Eliminar tarea | Sí (JWT) |

### 2.3 Otros Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /health | Estado del servidor |

---

## 3. Manejo de Archivos y Base de Datos

### 3.1 Configuración de MySQL

La aplicación utiliza MySQL como base de datos. La configuración se encuentra en `src/config/database.js`:

```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'todo_api',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

### 3.2 Esquema de Base de Datos

#### Tabla: users
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: tasks
```sql
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  userId VARCHAR(36) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3.3 Servicios

#### UserService (`src/services/userService.js`)
- `findUserByUsername(username)` - Buscar usuario por nombre
- `findUserById(id)` - Buscar usuario por ID
- `createUser(username, password)` - Crear usuario con contraseña encriptada
- `validatePassword(user, password)` - Validar contraseña
- `createToken(user)` - Generar token JWT

#### TaskService (`src/services/taskService.js`)
- `getAllTasks(userId)` - Obtener todas las tareas del usuario
- `getTaskById(id, userId)` - Obtener tarea por ID
- `createTask(title, description, userId)` - Crear tarea
- `updateTask(id, updates, userId)` - Actualizar tarea
- `deleteTask(id, userId)` - Eliminar tarea

---

## 4. Sistema de Autenticación

### 4.1 Tecnologías Utilizadas

- **bcryptjs**: Para encriptar contraseñas
- **jsonwebtoken**: Para generar y verificar tokens JWT
- **express-session**: Para gestionar sesiones

### 4.2 Flujo de Autenticación

1. **Registro de Usuario**:
   - El usuario envía `username` y `password`
   - La contraseña se encripta con bcrypt (10 rondas de salt)
   - Se guarda el usuario en la base de datos

2. **Inicio de Sesión**:
   - El usuario envía `username` y `password`
   - Se verifica el usuario y la contraseña
   - Se genera un token JWT con el ID y username del usuario
   - El token expira en 24 horas

3. **Protección de Rutas**:
   - El middleware `authenticate` verifica el token en el header `Authorization: Bearer <token>`
   - Si el token es válido, se añade el usuario a `req.user`
   - Las tareas se filtran por el ID del usuario autenticado

### 4.3 Código del Middleware de Autenticación

```javascript
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
  }

  const token = authHeader.substring(7);
  let decoded;
  
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  const user = await userService.findUserById(decoded.id);
  
  if (!user) {
    return res.status(401).json({ error: 'Usuario no encontrado' });
  }

  req.user = user;
  req.token = token;
  next();
}
```

---

## 5. Manejo de Errores

### 5.1 Middleware de Errores (`src/middleware/errorHandler.js`)

El middleware captura y gestiona errores en toda la aplicación:

- **Errores de validación**: Estado 400
- **Errores de autenticación**: Estado 401
- **Errores de base de datos**: Estado 500
- **Rutas no encontradas**: Estado 404

### 5.2 Validación de Datos (`src/middleware/validation.js`)

- **validateAuthInput**: Valida username y password
- **validateTaskInput**: Valida título y descripción (título requerido para POST, opcional para PUT)

---

## 6. Uso del Frontend

### 6.1 Estructura

- **index.html**: Página principal con formulario de login/registro y lista de tareas
- **styles.css**: Estilos modernos con colores personalizados
- **app.js**: Lógica del frontend (consumo de API)

### 6.2 Flujo de Usuario

1. El usuario se registra o inicia sesión
2. El token JWT se guarda en `localStorage`
3. El usuario puede crear, completar y eliminar tareas
4. Al cerrar sesión, se elimina el token del `localStorage`

---

## 7. Configuración de Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| PORT | Puerto del servidor | 3002 |
| DB_HOST | Host de MySQL | localhost |
| DB_USER | Usuario de MySQL | root |
| DB_PASS | Contraseña de MySQL | (vacío) |
| DB_NAME | Nombre de la base de datos | todo_api |
| JWT_SECRET | Clave secreta para JWT | (valor por defecto) |

---

## 8. Ejemplos de Uso

### 8.1 Registro de Usuario
```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"usuario","password":"contraseña"}'
```

### 8.2 Inicio de Sesión
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"usuario","password":"contraseña"}'
```

### 8.3 Crear Tarea
```bash
curl -X POST http://localhost:3002/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Mi tarea","description":"Descripción"}'
```

### 8.4 Listar Tareas
```bash
curl http://localhost:3002/api/tasks \
  -H "Authorization: Bearer <token>"
```

---

## 9. Ejecutar el Proyecto

```bash
# Instalar dependencias
npm install

# Iniciar el servidor
npm start

# El servidor estará disponible en http://localhost:3002
```
