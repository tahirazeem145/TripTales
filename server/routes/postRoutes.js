import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  toggleLikePost,
  addComment,
  deletePost,
  toggleSavePost,
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: GET /api/posts, Private: POST /api/posts
router.route('/').get(getPosts).post(protect, createPost);

// Public: GET /api/posts/:id, Private: DELETE /api/posts/:id
router.route('/:id').get(getPostById).delete(protect, deletePost);

// Private: Toggle like on a post
router.put('/:id/like', protect, toggleLikePost);

// Private: Add comment
router.post('/:id/comment', protect, addComment);

// Private: Save / Bookmark post
router.put('/:id/save', protect, toggleSavePost);

export default router;
