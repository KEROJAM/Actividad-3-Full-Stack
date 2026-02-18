function validateTaskInput(req, res, next) {
  const { title, description } = req.body;
  const isUpdate = req.method === 'PUT';
  const errors = [];

  if (!isUpdate && (!title || typeof title !== 'string' || title.trim().length === 0)) {
    errors.push('El título es requerido y debe ser una cadena no vacía');
  }

  if (title && title.length > 100) {
    errors.push('El título no puede exceder 100 caracteres');
  }

  if (description && typeof description !== 'string') {
    errors.push('La descripción debe ser una cadena');
  }

  if (description && description.length > 500) {
    errors.push('La descripción no puede exceder 500 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  req.validatedData = {
    title: title?.trim(),
    description: description?.trim()
  };

  next();
}

function validateAuthInput(req, res, next) {
  const { username, password } = req.body;
  const errors = [];

  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    errors.push('El nombre de usuario es requerido');
  }

  if (!password || typeof password !== 'string' || password.length < 4) {
    errors.push('La contraseña debe tener al menos 4 caracteres');
  }

  if (username && username.length > 50) {
    errors.push('El nombre de usuario no puede exceder 50 caracteres');
  }

  if (password && password.length > 100) {
    errors.push('La contraseña no puede exceder 100 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  req.validatedData = {
    username: username.trim(),
    password
  };

  next();
}

module.exports = {
  validateTaskInput,
  validateAuthInput
};
