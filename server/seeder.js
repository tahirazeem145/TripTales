import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Post from './models/Post.js';

dotenv.config();

const sampleUsers = [
  {
    name: 'Elena Rostova',
    email: 'elena@triptales.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    bio: 'Photographer & solo explorer chasing alpine sunsets and misty peaks 🏔️📷',
  },
  {
    name: 'Liam Chen',
    email: 'liam@triptales.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Architecture buff & street food lover currently roaming East Asia 🍜⛩️',
  },
  {
    name: 'Aria Bennett',
    email: 'aria@triptales.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Ocean enthusiast, scuba diver & coastal wanderer 🌊🏄‍♀️',
  },
];

const samplePosts = [
  {
    title: 'First Light over Tre Cime di Lavaredo',
    description:
      'Woke up at 4:30 AM to catch the alpine glow burning through the mist. The sheer limestone walls of the Dolomites felt monumental under the morning pastel skies.',
    location: {
      name: 'Dolomites, South Tyrol',
      country: 'Italy',
      lat: 46.6186,
      lng: 12.3015,
    },
    imageUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    category: 'Mountains',
    tags: ['dolomites', 'hiking', 'mountains', 'sunrise', 'italy'],
  },
  {
    title: 'Autumn Rain in the Bamboo Groves of Arashiyama',
    description:
      'The rhythmic tap of raindrops against hollow bamboo stalks is one of Kyoto’s purest sounds. Early morning strolls here before the crowds arrive are pure meditation.',
    location: {
      name: 'Kyoto, Kansai',
      country: 'Japan',
      lat: 35.0163,
      lng: 135.6713,
    },
    imageUrl:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    category: 'Nature',
    tags: ['japan', 'kyoto', 'bamboo', 'culture', 'zen'],
  },
  {
    title: 'Cliffside Sunset Over Positano',
    description:
      'Watching the terracotta houses turn golden under the Mediterranean dusk with a fresh glass of Limoncello. The winding coastal road was thrilling, but this view makes it worth every turn.',
    location: {
      name: 'Amalfi Coast, Campania',
      country: 'Italy',
      lat: 40.6281,
      lng: 14.485,
    },
    imageUrl:
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    category: 'Beaches',
    tags: ['amalfi', 'positano', 'sunset', 'mediterranean', 'coastal'],
  },
  {
    title: 'Dawn Over the Fairy Chimneys of Cappadocia',
    description:
      'Over a hundred hot air balloons rising in unison over volcanic valleys and cave dwellings. A surreal dreamscape that words can barely do justice.',
    location: {
      name: 'Göreme, Cappadocia',
      country: 'Turkey',
      lat: 38.6431,
      lng: 34.8289,
    },
    imageUrl:
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
    category: 'Adventure',
    tags: ['cappadocia', 'balloons', 'sunrise', 'wanderlust', 'turkey'],
  },
  {
    title: 'Emerald Terraces of Jatiluwih',
    description:
      'Countless stepped green rice fields stretching across hillsides into the clouds. The ancient Subak irrigation system has sustained these valleys for over a thousand years.',
    location: {
      name: 'Bali, Tabanan',
      country: 'Indonesia',
      lat: -8.3698,
      lng: 115.1311,
    },
    imageUrl:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    category: 'Nature',
    tags: ['bali', 'ricefields', 'indonesia', 'tropical', 'landscape'],
  },
  {
    title: 'Golden Hour Reflections on the Seine',
    description:
      'Paris reveals its true romance right after twilight. Strolling along the riverbank bridges while the Eiffel Tower starts its sparkling dance.',
    location: {
      name: 'Paris, Île-de-France',
      country: 'France',
      lat: 48.8566,
      lng: 2.3522,
    },
    imageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    category: 'Cities',
    tags: ['paris', 'france', 'architecture', 'cityscape', 'europe'],
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🌱 Connected to MongoDB Atlas for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Post.deleteMany();
    console.log('🧹 Cleared old data.');

    // Create users (pre-save hook will hash passwords)
    const createdUsers = await User.create(sampleUsers);
    console.log(`👤 Created ${createdUsers.length} sample community users.`);

    // Attach sample users as authors of posts
    const postsWithAuthors = samplePosts.map((post, idx) => {
      const author = createdUsers[idx % createdUsers.length];
      const otherUser = createdUsers[(idx + 1) % createdUsers.length];
      return {
        ...post,
        author: author._id,
        likes: [otherUser._id],
        comments: [
          {
            user: otherUser._id,
            userName: otherUser.name,
            userAvatar: otherUser.avatar,
            text: 'Incredible shot! What camera did you use for this?',
            createdAt: new Date(),
          },
        ],
      };
    });

    await Post.create(postsWithAuthors);
    console.log(`📸 Created ${postsWithAuthors.length} sample travel stories.`);

    console.log('🎉 Seeding successfully finished!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
