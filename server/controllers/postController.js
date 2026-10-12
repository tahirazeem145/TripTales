import Post from '../models/Post.js';
import User from '../models/User.js';

/**
 * @desc    Get all travel posts (with filtering, search, and pagination)
 * @route   GET /api/posts
 * @access  Public
 */
export const getPosts = async (req, res) => {
  try {
    const { category, search, tag, page = 1, limit = 12 } = req.query;

    const query = {};

    // Filter by Category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by Tag
    if (tag) {
      query.tags = tag.toLowerCase();
    }

    // Text search in title or location name
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'location.name': { $regex: search, $options: 'i' } },
        { 'location.country': { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: posts.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: posts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single post by ID
 * @route   GET /api/posts/:id
 * @access  Public
 */
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name avatar bio')
      .populate('comments.user', 'name avatar');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a new travel post
 * @route   POST /api/posts
 * @access  Private
 */
export const createPost = async (req, res) => {
  try {
    const { title, description, location, imageUrl, category, tags } = req.body;

    if (!title || !description || !imageUrl || !location || !location.name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, imageUrl, and location name',
      });
    }

    // Parse tags if provided as comma-separated string or array
    let parsedTags = [];
    if (Array.isArray(tags)) {
      parsedTags = tags.map((t) => t.trim().toLowerCase());
    } else if (typeof tags === 'string') {
      parsedTags = tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
    }

    const post = await Post.create({
      title,
      description,
      location,
      imageUrl,
      category: category || 'Adventure',
      tags: parsedTags,
      author: req.user._id,
    });

    const populatedPost = await Post.findById(post._id).populate('author', 'name avatar');

    res.status(201).json({
      success: true,
      data: populatedPost,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Like or Unlike a travel post
 * @route   PUT /api/posts/:id/like
 * @access  Private
 */
export const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userIdStr = req.user._id.toString();
    const hasLiked = post.likes.some((id) => id.toString() === userIdStr);

    if (hasLiked) {
      // Unlike: remove userId from likes array
      post.likes = post.likes.filter((id) => id.toString() !== userIdStr);
    } else {
      // Like: add userId to likes array
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      success: true,
      liked: !hasLiked,
      likesCount: post.likes.length,
      likes: post.likes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Add comment to a post
 * @route   POST /api/posts/:id/comment
 * @access  Private
 */
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = {
      user: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.unshift(comment); // Put newest comments at the top
    await post.save();

    res.status(201).json({
      success: true,
      data: post.comments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete post
 * @route   DELETE /api/posts/:id
 * @access  Private (Post author only)
 */
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Ensure only post creator can delete it
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post',
      });
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Bookmark / Save post for current user
 * @route   PUT /api/posts/:id/save
 * @access  Private
 */
export const toggleSavePost = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const postId = req.params.id;

    const hasSaved = user.savedPosts.some((id) => id.toString() === postId);

    if (hasSaved) {
      user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId);
    } else {
      user.savedPosts.push(postId);
    }

    await user.save();

    res.json({
      success: true,
      saved: !hasSaved,
      savedPosts: user.savedPosts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
