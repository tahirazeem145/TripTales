import mongoose from 'mongoose';

/**
 * Post Schema for TripTales
 * Represents travel photos, stories, and journeys
 */
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for your travel story'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please share your travel story or caption'],
      trim: true,
    },
    location: {
      name: {
        type: String,
        required: [true, 'Please specify the location or city name'],
      },
      country: {
        type: String,
        default: '',
      },
      lat: {
        type: Number,
        default: null,
      },
      lng: {
        type: Number,
        default: null,
      },
    },
    imageUrl: {
      type: String,
      required: [true, 'Please provide a travel photo URL'],
    },
    category: {
      type: String,
      enum: ['Mountains', 'Beaches', 'Cities', 'Nature', 'Historical', 'Adventure', 'Food & Culture'],
      default: 'Adventure',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    // Reference to the User who created the post
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Array of User IDs who liked this post
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Nested comments array
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        userName: {
          type: String,
          required: true,
        },
        userAvatar: {
          type: String,
          default: '',
        },
        text: {
          type: String,
          required: [true, 'Comment text cannot be empty'],
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for high-speed searching by title, location, and tags
postSchema.index({ title: 'text', 'location.name': 'text', tags: 'text' });

const Post = mongoose.model('Post', postSchema);

export default Post;
