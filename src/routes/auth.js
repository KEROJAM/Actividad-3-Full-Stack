const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const { validateAuthInput } = require('../middleware/validation');
const { authenticate } = require('../middleware/authenticate');

router.post('/register', validateAuthInput, async (req, res, next) => {
  try {
    const { username, password } = req.validatedData;
    
    const user = await userService.createUser(username, password);
    
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    if (error.message === 'El usuario ya existe') {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
});

router.post('/login', validateAuthInput, async (req, res, next) => {
  try {
    const { username, password } = req.validatedData;
    
    const user = await userService.findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValid = await userService.validatePassword(user, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = await userService.createToken(user);

    res.json({
      message: 'Login exitoso',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', authenticate, async (req, res, next) => {
  try {
    res.json({ message: 'Logout exitoso' });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
