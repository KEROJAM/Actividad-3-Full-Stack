const express = require('express');
const router = express.Router();
const postService = require('../services/postService');
const { authenticate } = require('../middleware/authenticate');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const posts = postService.getAllPosts();
    res.json({ posts });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = postService.getPostById(req.params.id);

    if (!result) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Título y contenido son requeridos' });
    }

    const post = postService.createPost(title, content, req.user.username);

    res.status(201).json({
      message: 'Publicación creada exitosamente',
      post
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/comments', async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'El contenido del comentario es requerido' });
    }

    const comment = postService.createComment(req.params.id, content, req.user.username);

    if (!comment) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    res.status(201).json({
      message: 'Comentario agregado exitosamente',
      comment
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
