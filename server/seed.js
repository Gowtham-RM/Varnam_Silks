import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Product from './models/Product.js';
import Order from './models/Order.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// Navigation Structure (Copied/Adapted from src/data/navigation.ts)
const NAV_ITEMS = [
  {
    label: 'Men',
    columns: [
      {
        title: 'Topwear',
        items: [
          { label: 'Shirts', sub: 'shirts', fabric: 'Cotton' },
          { label: 'T-Shirts', sub: 't-shirts', fabric: 'Cotton' },
          { label: 'Kurtas', sub: 'kurtas', fabric: 'Cotton' },
        ],
      },
      {
        title: 'Bottomwear',
        items: [
          { label: 'Jeans', sub: 'jeans', fabric: 'Denim' },
          { label: 'Trousers', sub: 'trousers', fabric: 'Cotton' },
          { label: 'Track Pants', sub: 'track-pants', fabric: 'Puck' },
        ],
      },
      {
        title: 'Ethnic Wear',
        items: [
          { label: 'Kurta Sets', sub: 'kurta-sets', fabric: 'Silk' },
          { label: 'Dhoti', sub: 'dhoti', fabric: 'Cotton' },
        ],
      },
      {
        title: 'Innerwear & Sleepwear',
        items: [
          { label: 'All Innerwear', sub: 'innerwear', fabric: 'Cotton' }
        ],
      },
    ],
  },
  {
    label: 'Women',
    columns: [
      {
        title: 'Topwear',
        items: [
          { label: 'Tops', sub: 'tops', fabric: 'Rayon' },
          { label: 'Kurtis', sub: 'kurtis', fabric: 'Cotton' },
          { label: 'Blouses', sub: 'blouses', fabric: 'Silk' },
        ],
      },
      {
        title: 'Bottomwear',
        items: [
          { label: 'Jeans', sub: 'jeans', fabric: 'Denim' },
          { label: 'Palazzos', sub: 'palazzos', fabric: 'Rayon' },
          { label: 'Leggings', sub: 'leggings', fabric: 'Lycra' },
          { label: 'Skirts', sub: 'skirts', fabric: 'Cotton' },
        ],
      },
      {
        title: 'Ethnic Wear',
        items: [
          { label: 'Sarees', sub: 'sarees', fabric: 'Silk' },
          { label: 'Silk Sarees', sub: 'silk-sarees', fabric: 'Silk' },
          { label: 'Cotton Sarees', sub: 'cotton-sarees', fabric: 'Cotton' },
          { label: 'Designer Sarees', sub: 'designer-sarees', fabric: 'Georgette' },
          { label: 'Wedding Sarees', sub: 'wedding-sarees', fabric: 'Silk' },
          { label: 'Salwar Suits', sub: 'salwar-suits', fabric: 'Silk' },
          { label: 'Lehenga', sub: 'lehenga', fabric: 'Silk' },
        ],
      },
      {
        title: 'Dresses',
        items: [
          { label: 'Casual Dresses', sub: 'casual-dresses', fabric: 'Cotton' },
          { label: 'Party Wear', sub: 'party-wear', fabric: 'Satin' },
        ],
      },
      {
        title: 'Dupattas & Shawls',
        items: [
          { label: 'All Dupattas', sub: 'dupattas', fabric: 'Chiffon' },
        ]
      },
      {
        title: 'Lingerie & Sleepwear',
        items: [
          { label: 'Bras', sub: 'bras', fabric: 'Lace' },
          { label: 'Panties', sub: 'panties', fabric: 'Cotton' },
          { label: 'Sleepwear', sub: 'sleepwear', fabric: 'Satin' },
        ]
      },
    ],
  },
  {
    label: 'Kids',
    columns: [
      {
        title: 'Boys',
        items: [
          { label: 'T-Shirts', sub: 'boys-t-shirts', fabric: 'Cotton' },
          { label: 'Ethnic Wear', sub: 'boys-ethnic', fabric: 'Silk' },
          { label: 'Shorts', sub: 'boys-shorts', fabric: 'Cotton' },
          { label: 'Shirts', sub: 'boys-shirts', fabric: 'Cotton' },
          { label: 'Innerwear', sub: 'boys-innerwear', fabric: 'Cotton' },
        ],
      },
      {
        title: 'Girls',
        items: [
          { label: 'Dresses & Skirts', sub: 'girls-dresses-skirts', fabric: 'Cotton' },
          { label: 'Ethnic Wear', sub: 'girls-ethnic', fabric: 'Silk' },
          { label: 'T-shirts & Tops', sub: 'girls-t-shirts-tops', fabric: 'Cotton' },
          { label: 'Innerwear', sub: 'girls-innerwear', fabric: 'Cotton' },
        ],
      },
      {
        title: 'Baby Boys',
        items: [
          { label: 'Combos Sets', sub: 'baby-boys-combos', fabric: 'Cotton' },
          { label: 'T-Shirts', sub: 'baby-boys-t-shirts', fabric: 'Cotton' },
          { label: 'Innerwear', sub: 'baby-boys-innerwear', fabric: 'Cotton' },
        ],
      },
      {
        title: 'Baby Girls',
        items: [
          { label: 'Combos Sets', sub: 'baby-girls-combos', fabric: 'Cotton' },
          { label: 'Dresses & Gowns', sub: 'baby-girls-dresses-gowns', fabric: 'Silk' },
          { label: 'Innerwear', sub: 'baby-girls-innerwear', fabric: 'Cotton' },
        ]
      }
    ],
  },
];

// Helper Data
const IMAGES = {
  'Men': {
    'Shirts': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
    'T-Shirts': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    'Kurtas': 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=500',
    'Jeans': 'https://images.unsplash.com/photo-1604176354204-9268737828fa?w=500',
    'Trousers': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500',
    'Track Pants': 'https://images.unsplash.com/photo-1552160753-117159d453fc?w=500',
    'Kurta Sets': 'https://images.unsplash.com/photo-1589810635657-232948ca97ef?w=500',
    'Dhoti': 'https://images.unsplash.com/photo-1631627520037-9b5523091954?w=500',
    'Innerwear': 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500',
    'All Innerwear': 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500' // Mapping for "All Innerwear" label
  },
  'Women': {
    'Tops': 'https://images.unsplash.com/photo-1551163943-3f6a29e39454?w=500',
    'Kurtis': 'https://images.unsplash.com/photo-1621574539165-1d4cb800d024?w=500',
    'Blouses': 'https://images.unsplash.com/photo-1621574539437-4b7b481646b7?w=500',
    'Jeans': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500',
    'Palazzos': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500',
    'Leggings': 'https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?w=500',
    'Skirts': 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500',
    'Sarees': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500',
    'Silk Sarees': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500',
    'Cotton Sarees': 'https://plus.unsplash.com/premium_photo-1682096352933-9d3118a95916?w=500',
    'Designer Sarees': 'https://images.unsplash.com/photo-1609357602737-78ac298a8650?w=500',
    'Wedding Sarees': 'https://images.unsplash.com/photo-1632207191677-22a76f2d5012?w=500',
    'Salwar Suits': 'https://images.unsplash.com/photo-1583391733960-6e4d7dfea22d?w=500',
    'Lehenga': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
    'Casual Dresses': 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500',
    'Party Wear': 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500',
    'Dupattas': 'https://images.unsplash.com/photo-1624698572118-2e0f49c065f3?w=500',
    'All Dupattas': 'https://images.unsplash.com/photo-1624698572118-2e0f49c065f3?w=500', // Mapping
    'Bras': 'https://images.unsplash.com/photo-1616486029423-aaa478965c97?w=500',
    'Panties': 'https://images.unsplash.com/photo-1596568359553-a56de6970068?w=500',
    'Sleepwear': 'https://images.unsplash.com/photo-1534126511673-b6899657816a?w=500'
  },
  'Kids': {
    'Boys': {
      'T-Shirts': 'https://images.unsplash.com/photo-1519238263430-660d12a2aa8d?w=500',
      'Ethnic Wear': 'https://images.unsplash.com/photo-1601647998802-bd962da15652?w=500',
      'Shorts': 'https://images.unsplash.com/photo-1503919545889-aef6dce20272?w=500',
      'Shirts': 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=500',
      'Innerwear': 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=500'
    },
    'Girls': {
      'Dresses': 'https://images.unsplash.com/photo-1622290291314-1f256e353287?w=500',
      'Ethnic Wear': 'https://images.unsplash.com/photo-1631524316361-9f93922c2ef7?w=500',
      'T-Shirts': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500', // Fixed capitalization
      'Innerwear': 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=500'
    },
    'Baby': {
      'Combos': 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=500',
      'T-Shirts': 'https://images.unsplash.com/photo-1515488042361-25f4682ae2d7?w=500',
      'Innerwear': 'https://images.unsplash.com/photo-1556012018-50c5c0da73bf?w=500',
      'Dresses': 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500'
    }
  }
};

const COLORS = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Pink', 'Grey', 'Navy', 'Orange'];
const PATTERNS = ['Solid', 'Printed', 'Striped', 'Checked', 'Floral', 'Embroidery'];
const FITS = ['Regular', 'Slim', 'Loose', 'Oversized'];
const SIZES = {
  'Alpha': ['S', 'M', 'L', 'XL'],
  'Numeric': ['28', '30', '32', '34'],
  'Saree': ['Free Size'],
  'Innerwear': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'MenInnerwear': ['M', 'L', 'XL', '80', '85', '90'],
  'Kids': ['2-3Y', '4-5Y', '6-7Y']
};

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProduct(category, subCategory, groupTitle) {
  let sizeType = 'Alpha';
  if (subCategory.includes('jeans') || subCategory.includes('trousers')) sizeType = 'Numeric';
  if (subCategory.includes('saree')) sizeType = 'Saree';
  if (category === 'Kids') sizeType = 'Kids';
  if (category === 'Men' && subCategory.includes('innerwear')) sizeType = 'MenInnerwear';
  if (category === 'Women' && (subCategory.includes('bra') || subCategory.includes('panties'))) sizeType = 'Innerwear';

  let availableSizes = SIZES[sizeType];
  // Select random 2-4 colors for this product
  const numColors = getRandomInt(2, 4);
  const selectedColors = [];
  while (selectedColors.length < numColors) {
    const color = getRandomItem(COLORS);
    if (!selectedColors.includes(color)) selectedColors.push(color);
  }

  let generatedSizes = availableSizes.map(s => {
    const sizeColors = selectedColors.map(c => ({
      color: c,
      stock: getRandomInt(0, 15),
      inStock: true
    }));
    return {
      size: s,
      colors: sizeColors
    };
  });

  let image = 'https://via.placeholder.com/500';

  if (category === 'Kids') {
    // Handle nested Kids structure
    let kidGroup = 'Boys'; // Default
    if (groupTitle.includes('Girl')) kidGroup = 'Girls';
    if (groupTitle.includes('Baby')) kidGroup = 'Baby';

    // Try to match based on subcategory keywords - using toLowerCase to be safe, but keys are Capitalized
    const subLower = subCategory.toLowerCase();

    if (subLower.includes('t-shirt') || subLower.includes('t-shirts')) image = IMAGES.Kids[kidGroup]['T-Shirts'];
    else if (subLower.includes('shirt')) image = IMAGES.Kids[kidGroup]['Shirts']; // Boys only
    else if (subLower.includes('ethnic')) image = IMAGES.Kids[kidGroup]['Ethnic Wear'];
    else if (subLower.includes('short')) image = IMAGES.Kids[kidGroup]['Shorts'];
    else if (subLower.includes('dress') || subLower.includes('skirt') || subLower.includes('gown')) image = IMAGES.Kids[kidGroup]['Dresses'];
    else if (subLower.includes('combo')) image = IMAGES.Kids[kidGroup]['Combos'];
    else if (subLower.includes('innerwear')) image = IMAGES.Kids[kidGroup]['Innerwear'];

    // Final fallback for Kids if still undefined
    if (!image || image === 'https://via.placeholder.com/500') {
      // Fallback to a general image for the kidGroup if a specific one wasn't found
      image = IMAGES.Kids[kidGroup]['T-Shirts'] || IMAGES.Kids[kidGroup]['Dresses'] || 'https://via.placeholder.com/500';
    }

  } else {
    // Handle Men/Women simple structure
    // subCategory is the item.label from NAV_ITEMS, which matches the IMAGES keys
    image = IMAGES[category][subCategory] || IMAGES[category]['Tops'] || 'https://via.placeholder.com/500';
  }

  return {
    name: `${getRandomItem(PATTERNS)} ${category} ${subCategory.replace('-', ' ')}`,
    description: `High quality ${subCategory} for ${category}. Made with premium materials for maximum comfort.`,
    price: getRandomInt(499, 4999),
    category: category,
    subCategory: subCategory,
    sizeType: sizeType,
    fit: getRandomItem(FITS),
    pattern: getRandomItem(PATTERNS),
    occasion: 'Casual',
    fabric: 'Cotton',
    image: image,
    images: [image],
    sizes: generatedSizes,
    colors: selectedColors,
    stock: generatedSizes.reduce((acc, size) => acc + size.colors.reduce((sAcc, c) => sAcc + c.stock, 0), 0),
    inStock: true,
    featured: Math.random() > 0.8,
    rating: (Math.random() * 2 + 3).toFixed(1),
    reviews: getRandomInt(0, 100),
    createdAt: new Date().toISOString()
  };
}

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

    // Generate and Insert products
    const products = [];
    const createdProducts = []; // Store created product docs to get IDs

    NAV_ITEMS.forEach(cat => {
      cat.columns.forEach(col => {
        col.items.forEach(item => {
          const count = getRandomInt(3, 5);
          for (let i = 0; i < count; i++) {
            const p = generateProduct(cat.label, item.label, col.title);
            p.fabric = item.fabric || 'Cotton';
            products.push(p);
          }
        });
      });
    });

    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ Seeded ${insertedProducts.length} products successfully`);

    // --- Generate Dummy Orders for Collaborative Filtering ---
    const orders = [];
    const usersList = await User.find();
    if (usersList.length > 0 && insertedProducts.length > 0) {

      // Helper to find products by subcategory
      const findProductsBySub = (sub) => insertedProducts.filter(p => p.subCategory === sub);
      const findProductsByCategory = (cat) => insertedProducts.filter(p => p.category === cat);

      // Pattern 1: Saree + Blouse
      const sarees = findProductsBySub('Sarees');
      const blouses = findProductsBySub('Blouses');
      // Pattern 2: Jeans + T-Shirt (Men)
      const menJeans = insertedProducts.filter(p => p.category === 'Men' && p.subCategory === 'Jeans');
      const menTShirts = insertedProducts.filter(p => p.category === 'Men' && p.subCategory === 'T-Shirts');
      // Pattern 3: Kurtis + Leggings
      const kurtis = findProductsBySub('Kurtis');
      const leggings = findProductsBySub('Leggings');

      // Create 50 random orders
      for (let i = 0; i < 50; i++) {
        const user = getRandomItem(usersList);
        let orderItems = [];

        const pattern = Math.random();
        if (pattern < 0.3 && sarees.length && blouses.length) {
          // Buy Saree + Blouse
          orderItems.push(getRandomItem(sarees));
          orderItems.push(getRandomItem(blouses));
        } else if (pattern < 0.6 && menJeans.length && menTShirts.length) {
          // Buy Jeans + T-Shirt
          orderItems.push(getRandomItem(menJeans));
          orderItems.push(getRandomItem(menTShirts));
        } else if (pattern < 0.8 && kurtis.length && leggings.length) {
          // Buy Kurti + Leggings
          orderItems.push(getRandomItem(kurtis));
          orderItems.push(getRandomItem(leggings));
        } else {
          // Random Mix
          orderItems.push(getRandomItem(insertedProducts));
          if (Math.random() > 0.5) orderItems.push(getRandomItem(insertedProducts));
        }

        // Construct Order Object
        const finalItems = orderItems.map(p => ({
          product: p._id,
          quantity: 1,
          price: p.price,
          size: p.sizes[0].size,
          color: p.colors[0]
        }));

        const total = finalItems.reduce((sum, item) => sum + item.price, 0);

        orders.push({
          user: user._id,
          items: finalItems,
          totalAmount: total,
          status: 'delivered',
          paymentMethod: 'Credit Card',
          paymentStatus: 'paid',
          shippingAddress: { street: '123 St', city: 'City', state: 'State', zipCode: '12345' },
          createdAt: new Date(Date.now() - getRandomInt(0, 30) * 86400000) // Random date in last 30 days
        });
      }

      await Order.insertMany(orders); // Assuming Order model is imported? No, need to import it.
      console.log(`✅ Seeded ${orders.length} dummy orders for ML`);
    }

    console.log(`👤 Created ${users.length} users`);
    console.log(`📦 Created ${insertedProducts.length} products`);

    mongoose.connection.close();
    console.log('👋 Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
