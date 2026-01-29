import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Product from './models/Product.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const products = [
  {
    name: "Elegant Silk Saree",
    description: "Premium silk saree with intricate embroidery work",
    price: 12999,
    category: "Sarees",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500"
    ],
    sizes: ["Free Size"],
    colors: ["Red", "Gold"],
    stock: 10,
    inStock: true,
    featured: true,
    rating: 4.8,
    reviews: 24
  },
  {
    name: "Designer Lehenga",
    description: "Beautiful designer lehenga with stone work",
    price: 24999,
    category: "Lehenga",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500",
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Pink", "Blue"],
    stock: 5,
    inStock: true,
    featured: true,
    rating: 4.9,
    reviews: 18
  },
  {
    name: "Cotton Kurti",
    description: "Comfortable cotton kurti for daily wear",
    price: 1499,
    category: "Kurti",
    image: "https://images.unsplash.com/photo-1583391733981-e7fd7c28a928?w=500",
    images: [
      "https://images.unsplash.com/photo-1583391733981-e7fd7c28a928?w=500"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Cream", "Blue"],
    stock: 20,
    inStock: true,
    featured: false,
    rating: 4.5,
    reviews: 32
  },
  {
    name: "Banarasi Silk Saree",
    description: "Traditional Banarasi silk saree with golden border",
    price: 18999,
    category: "Sarees",
    image: "https://images.unsplash.com/photo-1617128739206-3141ba155c65?w=500",
    images: [
      "https://images.unsplash.com/photo-1617128739206-3141ba155c65?w=500"
    ],
    sizes: ["Free Size"],
    colors: ["Maroon", "Gold"],
    stock: 8,
    inStock: true,
    featured: true,
    rating: 4.7,
    reviews: 15
  },
  {
    name: "Anarkali Suit",
    description: "Elegant Anarkali suit with dupatta",
    price: 8999,
    category: "Suits",
    image: "https://images.unsplash.com/photo-1583391733960-6e4d7dfea22d?w=500",
    images: [
      "https://images.unsplash.com/photo-1583391733960-6e4d7dfea22d?w=500"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Green", "Red", "Black"],
    stock: 12,
    inStock: true,
    featured: false,
    rating: 4.6,
    reviews: 21
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users with hashed passwords
    const salt = await bcrypt.genSalt(10);
    const users = [
      {
        name: 'Admin User',
        email: 'admin@varnamsilks.com',
        password: await bcrypt.hash('admin123', salt),
        role: 'admin'
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: await bcrypt.hash('password123', salt),
        role: 'user'
      }
    ];

    await User.insertMany(users);
    console.log('✅ Seeded users successfully');

    // Insert products
    await Product.insertMany(products);
    console.log('✅ Seeded products successfully');

    console.log(`👤 Created ${users.length} users`);
    console.log(`📦 Created ${products.length} products`);
    
    mongoose.connection.close();
    console.log('👋 Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
