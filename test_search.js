import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { performSmartSearch } from './server/services/searchService.js';
import Product from './server/models/Product.js';

dotenv.config();

async function runTests() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Test 1: Typo correction (sare -> saree)
    console.log('\n--- Test 1: Typo "sare" ---');
    let result = await performSmartSearch({ q: 'sare' });
    console.log('Total Results:', result.total);
    if (result.suggestion) {
        console.log('Suggestion (Did you mean?):', result.suggestion);
    } else {
        console.log('No suggestion. Matches found:', result.products.map(p => p.name).slice(0, 3));
    }

    // Test 2: Partial Keyword ("sil" -> "silk")
    console.log('\n--- Test 2: Partial "sil" ---');
    result = await performSmartSearch({ q: 'sil' });
    console.log('Total:', result.total, 'Hits:', result.products.map(p => p.name).slice(0, 3));

    // Test 3: Filters (category: men)
    console.log('\n--- Test 3: Filter (category: men) ---');
    result = await performSmartSearch({ category: 'men' });
    console.log('Total:', result.total, 'Hits:', result.products.map(p => p.category).slice(0, 3));

    // Test 4: Search + Filters (q: shirt, maxPrice: 1000)
    console.log('\n--- Test 4: filter+search "shirt", max 1000 ---');
    result = await performSmartSearch({ q: 'shirt', maxPrice: '1000' });
    console.log('Total:', result.total, 'Hits:', result.products.map(p => `${p.name} - ₹${p.price}`).slice(0, 3));

    process.exit(0);
}

runTests();
