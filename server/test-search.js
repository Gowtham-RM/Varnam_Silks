import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Product from './models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

async function testSearch() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/varnam_silks');
    console.log('Connected to database');
    
    // Check total products
    const count = await Product.countDocuments();
    console.log('Total products in database:', count);
    
    // Find shirt products
    const shirts = await Product.find({ 
      $or: [
        { name: { $regex: 'shirt', $options: 'i' } },
        { subCategory: { $regex: 'shirt', $options: 'i' } }
      ]
    }).limit(5);
    console.log('Shirt products found:', shirts.length);
    
    if (shirts.length > 0) {
      console.log('\nSample shirt product:');
      console.log('Name:', shirts[0].name);
      console.log('Category:', shirts[0].category);
      console.log('SubCategory:', shirts[0].subCategory);
      console.log('Colors:', shirts[0].colors);
      console.log('Fabric:', shirts[0].fabric);
    }
    
    // Find white products
    const whiteProducts = await Product.find({ 
      colors: { $regex: 'white', $options: 'i' }
    }).limit(3);
    console.log('\nWhite products found:', whiteProducts.length);
    
    if (whiteProducts.length > 0) {
      console.log('Sample white product:');
      console.log('Name:', whiteProducts[0].name);
      console.log('Colors:', whiteProducts[0].colors);
    }
    
    // Find white shirts
    const whiteShirts = await Product.find({
      $and: [
        { 
          $or: [
            { name: { $regex: 'shirt', $options: 'i' } },
            { subCategory: { $regex: 'shirt', $options: 'i' } }
          ]
        },
        { colors: { $regex: 'white', $options: 'i' } }
      ]
    });
    console.log('\nWhite shirt products found:', whiteShirts.length);
    
    if (whiteShirts.length > 0) {
      console.log('Sample white shirt:');
      console.log('Name:', whiteShirts[0].name);
      console.log('Category:', whiteShirts[0].category);
      console.log('Colors:', whiteShirts[0].colors);
    }
    
    await mongoose.disconnect();
    console.log('\nDatabase check complete!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testSearch();
