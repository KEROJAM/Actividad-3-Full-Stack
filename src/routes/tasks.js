const express = require('express');
const router = express.Router();
const taskService = require('../services/taskService');
const { authenticate } = require('../middleware/authenticate');
const { validateTaskInput } = require('../middleware/validation');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const tasks = await taskService.getAllTasks(req.user.id);
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    res.json({ task });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateTaskInput, async (req, res, next) => {
  try {
    const { title, description } = req.validatedData;
    const task = await taskService.createTask(title, description, req.user.id);
    
    res.status(201).json({
      message: 'Tarea creada exitosamente',
      task
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { title, description } = req.validatedData || {};
    const updates = {};
    
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (req.body.completed !== undefined) updates.completed = req.body.completed;

    const task = await taskService.updateTask(req.params.id, updates, req.user.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    res.json({
      message: 'Tarea actualizada exitosamente',
      task
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await taskService.deleteTask(req.params.id, req.user.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    res.json({ message: 'Tarea eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
