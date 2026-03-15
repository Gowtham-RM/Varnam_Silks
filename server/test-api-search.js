import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { performSmartSearch } from './services/searchService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

async function testSearchAPI() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/varnam_silks');
    console.log('Connected to database\n');
    
    // Test 1: Search for "white shirt"
    console.log('=== Test 1: Searching for "white shirt" ===');
    const result1 = await performSmartSearch({ q: 'white shirt' });
    console.log('Products found:', result1.products.length);
    console.log('Total:', result1.total);
    console.log('Suggestion:', result1.suggestion);
    if (result1.products.length > 0) {
      console.log('First result:', {
        name: result1.products[0].name,
        category: result1.products[0].category,
        colors: result1.products[0].colors
      });
    }
    
    // Test 2: Search for just "shirt"
    console.log('\n=== Test 2: Searching for "shirt" ===');
    const result2 = await performSmartSearch({ q: 'shirt' });
    console.log('Products found:', result2.products.length);
    if (result2.products.length > 0) {
      console.log('First result:', {
        name: result2.products[0].name,
        category: result2.products[0].category,
        colors: result2.products[0].colors
      });
    }
    
    // Test 3: Search for just "white"
    console.log('\n=== Test 3: Searching for "white" ===');
    const result3 = await performSmartSearch({ q: 'white' });
    console.log('Products found:', result3.products.length);
    if (result3.products.length > 0) {
      console.log('First result:', {
        name: result3.products[0].name,
        category: result3.products[0].category,
        colors: result3.products[0].colors
      });
    }
    
    // Test 4: Search with typo "whit shrt"
    console.log('\n=== Test 4: Searching for "whit shrt" (typo) ===');
    const result4 = await performSmartSearch({ q: 'whit shrt' });
    console.log('Products found:', result4.products.length);
    console.log('Suggestion:', result4.suggestion);
    
    await mongoose.disconnect();
    console.log('\n✅ Search API test complete!');
  } catch (error) {
    console.error('Error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

testSearchAPI();
