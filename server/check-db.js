import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
const total = await Product.countDocuments();
const withFabric = await Product.countDocuments({ fabric: { $exists: true, $ne: '', $ne: null } });
const withoutFabric = await Product.countDocuments({ $or: [{ fabric: { $exists: false } }, { fabric: '' }, { fabric: null }] });
console.log(`Total: ${total}, With fabric: ${withFabric}, Without fabric: ${withoutFabric}`);
const sample = await Product.findOne({}, 'name subCategory fabric');
console.log('Sample product:', JSON.stringify(sample));
await mongoose.disconnect();
