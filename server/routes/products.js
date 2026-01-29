import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Transform MongoDB document to frontend format
const transformProduct = (product) => {
  const obj = product.toObject();
  return {
    ...obj,
    id: obj._id.toString(),
    _id: undefined
  };
};

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    const transformedProducts = products.map(transformProduct);
    res.json(transformedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(transformProduct(product));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product
router.post('/', async (req, res) => {
  const product = new Product(req.body);
  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
