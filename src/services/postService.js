const { v4: uuidv4 } = require('uuid');
const { getPosts, savePosts, getComments, saveComments } = require('../config/database');

function getAllPosts() {
  const postsData = getPosts();
  const commentsData = getComments();

  return postsData.posts
    .map(post => {
      const commentCount = commentsData.comments.filter(c => c.postId === post.id).length;
      return { ...post, comment_count: commentCount };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getPostById(id) {
  const postsData = getPosts();
  const commentsData = getComments();

  const post = postsData.posts.find(p => p.id === id);
  if (!post) return null;

  const comments = commentsData.comments
    .filter(c => c.postId === id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return { post, comments };
}

function createPost(title, content, author) {
  const data = getPosts();
  const now = new Date().toISOString();

  const newPost = {
    id: uuidv4(),
    title,
    content,
    author,
    created_at: now,
    updated_at: now
  };

  data.posts.push(newPost);
  savePosts(data);

  return newPost;
}

function createComment(postId, content, author) {
  const postData = getPosts();
  const post = postData.posts.find(p => p.id === postId);

  if (!post) {
    return null;
  }

  const data = getComments();
  const now = new Date().toISOString();

  const newComment = {
    id: uuidv4(),
    postId,
    content,
    author,
    created_at: now
  };

  data.comments.push(newComment);
  saveComments(data);

  return newComment;
}

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  createComment
};
