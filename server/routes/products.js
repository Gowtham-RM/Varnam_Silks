import express from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import natural from 'natural';

const router = express.Router();

// Transform MongoDB document to frontend format
const transformProduct = (product) => {
  const obj = product.toObject();
  return {
    ...obj,
    id: obj._id.toString(),
    _id: undefined,
    colorImages: obj.colorImages || []
  };
};

import { getRecommendations } from '../services/recommendationService.js';
import { performSmartSearch } from '../services/searchService.js';

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

// Smart Search with Typo Correction, Fuzzy Matching & Filters
router.get('/search', async (req, res) => {
  try {
    const result = await performSmartSearch(req.query);
    res.json(result);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get product recommendations (Weighted Scoring)
router.get('/:id/recommendations', async (req, res) => {
  try {
    const { id } = req.params;
    const targetProduct = await Product.findById(id);

    if (!targetProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Fetch candidates (Optimization: Fetch only same category + slightly more, or all if small dataset)
    // For 180 products, fetching all is fine.
    const allProducts = await Product.find({ _id: { $ne: id } });

    const recommendations = await getRecommendations(targetProduct, allProducts);

    // Transform before sending
    const transformed = recommendations.map(transformProduct);
    res.json(transformed);

  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single product
// Get "Users Also Bought" recommendations (Collaborative Filtering)
router.get('/:id/also-bought', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find completed orders containing this product
    // Optimization: Look at last 50 orders instead of 10 for better data
    const orders = await Order.find({
      'items.product': id,
      status: { $ne: 'cancelled' }
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('items.product');

    if (orders.length === 0) {
      return res.json([]);
    }

    // 2. Extract co-occurring products with simple frequency counting
    const productFrequency = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!item.product || !item.product._id) return;

        const productId = item.product._id.toString();
        // Skip the target product itself
        if (productId !== id) {
          if (!productFrequency[productId]) {
            productFrequency[productId] = {
              product: item.product,
              count: 0
            };
          }
          productFrequency[productId].count += 1;
        }
      });
    });

    // 3. Sort by frequency and take top 4
    const frequentProducts = Object.values(productFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map(item => transformProduct(item.product));

    res.json(frequentProducts);

  } catch (error) {
    console.error('Also Bought error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Check if user can rate a product
router.get('/:id/can-rate', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id']; // Temporary simple auth like in orders.js

    if (!userId) {
      return res.status(401).json({ message: 'User ID required' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the user has already rated
    if (product.ratedBy && product.ratedBy.includes(userId)) {
      return res.json({ canRate: false, reason: 'Already rated by this user' });
    }

    // Check if the user has ordered the product
    const order = await Order.findOne({
      user: userId,
      'items.product': id,
      status: { $in: ['delivered', 'shipped', 'processing', 'pending'] } // Or strict to 'delivered' but allow processing for testing
    });

    if (!order) {
      return res.json({ canRate: false, reason: 'Product not purchased' });
    }

    res.json({ canRate: true });

  } catch (error) {
    console.error('Check rate eligibility error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Rate a product
router.post('/:id/rate', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ message: 'User ID required' });
    }

    if (rating === undefined || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid rating between 1 and 5 is required' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Prevent duplicate ratings
    if (product.ratedBy && product.ratedBy.includes(userId)) {
      return res.status(400).json({ message: 'You have already rated this product' });
    }

    // Verify ordering
    const order = await Order.findOne({
      user: userId,
      'items.product': id,
      status: { $ne: 'cancelled' } // Any active/completed order
    });

    if (!order) {
      return res.status(403).json({ message: 'You can only rate products you have purchased' });
    }

    // Calculate new average rating
    const currentRating = product.rating || 0;
    const currentReviews = product.reviews || 0;

    product.rating = Number((((currentRating * currentReviews) + rating) / (currentReviews + 1)).toFixed(1));
    product.reviews = currentReviews + 1;
    product.ratedBy.push(userId);

    await product.save();

    res.json(transformProduct(product));

  } catch (error) {
    console.error('Rate product error:', error);
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
