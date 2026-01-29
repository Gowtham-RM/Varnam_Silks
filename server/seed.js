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
  // Men
  {
    name: "Classic Oxford Shirt",
    description: "Premium cotton oxford shirt perfect for formal and casual wear.",
    price: 2499,
    category: "Men",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500",
    images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blue", "White"],
    stock: 25,
    inStock: true,
    featured: true,
    rating: 4.6,
    reviews: 28
  },
  {
    name: "Slim Fit Chinos",
    description: "Comfortable stretch chinos in beige.",
    price: 1999,
    category: "Men",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500",
    images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500"],
    sizes: ["30", "32", "34", "36"],
    colors: ["Beige", "Navy"],
    stock: 20,
    inStock: true,
    featured: false,
    rating: 4.4,
    reviews: 15
  },
  {
    name: "Denim Trucker Jacket",
    description: "Classic denim jacket with a vintage wash.",
    price: 3499,
    category: "Men",
    image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500",
    images: ["https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500"],
    sizes: ["M", "L", "XL"],
    colors: ["Blue"],
    stock: 15,
    inStock: true,
    featured: true,
    rating: 4.8,
    reviews: 32
  },
  {
    name: "Premium Crew Neck T-Shirt",
    description: "Soft organic cotton t-shirt in essential manufacturing colors.",
    price: 899,
    category: "Men",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black", "Grey"],
    stock: 50,
    inStock: true,
    featured: false,
    rating: 4.3,
    reviews: 45
  },
  {
    name: "Traditional Silk Kurta",
    description: "Festive silk kurta with subtle embroidery.",
    price: 2999,
    category: "Men",
    image: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=500",
    images: ["https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=500"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Yellow", "Cream"],
    stock: 12,
    inStock: true,
    featured: true,
    rating: 4.7,
    reviews: 18
  },

  // Women
  {
    name: "Floral Summer Maxi Dress",
    description: "Lightweight and breezy floral print dress.",
    price: 3299,
    category: "Women",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500",
    images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500"],
    sizes: ["XS", "S", "M", "L"],
    colors: ["Pink", "Blue"],
    stock: 18,
    inStock: true,
    featured: true,
    rating: 4.9,
    reviews: 56
  },
  {
    name: "Kanjivaram Silk Saree",
    description: "Authentic handwoven Kanjivaram silk saree.",
    price: 15999,
    category: "Women",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500",
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500"],
    sizes: ["Free Size"],
    colors: ["Red", "Gold"],
    stock: 8,
    inStock: true,
    featured: true,
    rating: 5.0,
    reviews: 42
  },
  {
    name: "High-Waist Skinny Jeans",
    description: "Stretch denim jeans with a flattering fit.",
    price: 2199,
    category: "Women",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500",
    images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500"],
    sizes: ["26", "28", "30", "32"],
    colors: ["Blue", "Black"],
    stock: 30,
    inStock: true,
    featured: false,
    rating: 4.5,
    reviews: 24
  },
  {
    name: "Embroidered Anarkali Suit",
    description: "Elegant floor-length Anarkali with dupatta.",
    price: 8499,
    category: "Women",
    image: "https://images.unsplash.com/photo-1583391733960-6e4d7dfea22d?w=500",
    images: ["https://images.unsplash.com/photo-1583391733960-6e4d7dfea22d?w=500"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Green"],
    stock: 10,
    inStock: true,
    featured: true,
    rating: 4.8,
    reviews: 19
  },
  {
    name: "Satin Silk Blouse",
    description: "Luxurious satin blouse suitable for work or evening.",
    price: 1899,
    category: "Women",
    image: "https://images.unsplash.com/photo-1621574539437-4b7b481646b7?w=500",
    images: ["https://images.unsplash.com/photo-1621574539437-4b7b481646b7?w=500"],
    sizes: ["S", "M", "L"],
    colors: ["Champagne", "Black"],
    stock: 22,
    inStock: true,
    featured: false,
    rating: 4.6,
    reviews: 14
  },

  // Kids
  {
    name: "Kids' Graphic T-Shirt",
    description: "Fun dinosaur print cotton t-shirt.",
    price: 599,
    category: "Kids",
    image: "https://images.unsplash.com/photo-1519238263430-660d12a2aa8d?w=500",
    images: ["https://images.unsplash.com/photo-1519238263430-660d12a2aa8d?w=500"],
    sizes: ["2-3Y", "4-5Y", "6-7Y"],
    colors: ["Blue", "Green"],
    stock: 40,
    inStock: true,
    featured: false,
    rating: 4.7,
    reviews: 35
  },
  {
    name: "Festive Lehenga Choli",
    description: "Bright and colorful lehenga for girls.",
    price: 3999,
    category: "Kids",
    image: "https://images.unsplash.com/photo-1622290291314-1f256e353287?w=500",
    images: ["https://images.unsplash.com/photo-1622290291314-1f256e353287?w=500"],
    sizes: ["3-4Y", "5-6Y", "7-8Y"],
    colors: ["Pink", "Orange"],
    stock: 15,
    inStock: true,
    featured: true,
    rating: 4.9,
    reviews: 22
  },
  {
    name: "Denim Dungarees",
    description: "Cute and durable denim dungarees.",
    price: 1499,
    category: "Kids",
    image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=500",
    images: ["https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=500"],
    sizes: ["2-3Y", "4-5Y"],
    colors: ["Blue"],
    stock: 25,
    inStock: true,
    featured: false,
    rating: 4.5,
    reviews: 18
  },
  {
    name: "Boys' Blazer Set",
    description: "Formal blazer and trouser set for parties.",
    price: 4499,
    category: "Kids",
    image: "https://images.unsplash.com/photo-1503919545889-aef6dce20272?w=500",
    images: ["https://images.unsplash.com/photo-1503919545889-aef6dce20272?w=500"],
    sizes: ["4-5Y", "6-7Y", "8-9Y"],
    colors: ["Navy", "Black"],
    stock: 10,
    inStock: true,
    featured: true,
    rating: 4.6,
    reviews: 12
  },
  {
    name: "Cotton Pajama Set",
    description: "Soft printed pajama set for nightwear.",
    price: 899,
    category: "Kids",
    image: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=500",
    images: ["https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=500"],
    sizes: ["2-3Y", "4-5Y", "6-7Y"],
    colors: ["White", "Yellow"],
    stock: 35,
    inStock: true,
    featured: false,
    rating: 4.4,
    reviews: 28
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
