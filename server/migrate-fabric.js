/**
 * One-time migration: add 'fabric' field to all existing products that lack it.
 * Run once: node server/migrate-fabric.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

// SubCategory label → default fabric mapping (derived from NAV_ITEMS in seed.js)
const FABRIC_MAP = {
  // Men
  'Shirts': 'Cotton',
  'T-Shirts': 'Cotton',
  'Kurtas': 'Cotton',
  'Jeans': 'Denim',
  'Trousers': 'Cotton',
  'Track Pants': 'Cotton',
  'Kurta Sets': 'Silk',
  'Dhoti': 'Cotton',
  'All Innerwear': 'Cotton',
  // Women Topwear
  'Tops': 'Rayon',
  'Kurtis': 'Cotton',
  'Blouses': 'Silk',
  // Women Bottomwear
  'Palazzos': 'Rayon',
  'Leggings': 'Lycra',
  'Skirts': 'Cotton',
  // Women Ethnic
  'Sarees': 'Silk',
  'Silk Sarees': 'Silk',
  'Cotton Sarees': 'Cotton',
  'Designer Sarees': 'Georgette',
  'Wedding Sarees': 'Silk',
  'Salwar Suits': 'Silk',
  'Lehenga': 'Silk',
  // Women Dresses
  'Casual Dresses': 'Cotton',
  'Party Wear': 'Satin',
  // Women Dupattas
  'All Dupattas': 'Chiffon',
  'Dupattas': 'Chiffon',
  // Women Lingerie
  'Bras': 'Lace',
  'Panties': 'Cotton',
  'Sleepwear': 'Satin',
  // Kids Boys
  'Ethnic Wear': 'Silk',
  'Shorts': 'Cotton',
  'Innerwear': 'Cotton',
  // Kids Girls
  'Dresses & Skirts': 'Cotton',
  'T-shirts & Tops': 'Cotton',
  // Baby
  'Combos Sets': 'Cotton',
  'Dresses & Gowns': 'Silk',
};

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Find products missing fabric
  const products = await Product.find({ $or: [{ fabric: { $exists: false } }, { fabric: '' }, { fabric: null }] });
  console.log(`Found ${products.length} products without fabric`);

  let updated = 0;
  for (const product of products) {
    const fabric = FABRIC_MAP[product.subCategory] || 'Cotton';
    await Product.updateOne({ _id: product._id }, { $set: { fabric } });
    updated++;
  }

  console.log(`✅ Updated ${updated} products with default fabric values`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
