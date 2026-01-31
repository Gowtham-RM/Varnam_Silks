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

// Get product recommendations (TF-IDF with breakdown)
router.get('/:id/recommendations', async (req, res) => {
  try {
    const { id } = req.params;
    const targetProduct = await Product.findById(id);

    if (!targetProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const allProducts = await Product.find({ _id: { $ne: id } });
    const TfIdf = natural.TfIdf;

    // Helper to calculate score for a specific field
    const calculateFieldScore = (targetText, products, fieldGetter) => {
      const tfidf = new TfIdf();
      products.forEach(product => {
        tfidf.addDocument(fieldGetter(product));
      });
      const scores = [];
      tfidf.tfidfs(targetText, function (i, measure) {
        scores.push(measure);
      });
      return scores;
    };

    const nameScores = calculateFieldScore(targetProduct.name, allProducts, p => p.name);
    const categoryScores = calculateFieldScore(targetProduct.category, allProducts, p => p.category);
    const descriptionScores = calculateFieldScore(targetProduct.description, allProducts, p => p.description);
    const colorScores = calculateFieldScore(targetProduct.colors.join(' '), allProducts, p => p.colors.join(' '));

    const results = allProducts.map((product, index) => {
      const breakdown = {
        name: nameScores[index] || 0,
        category: categoryScores[index] || 0,
        description: descriptionScores[index] || 0,
        colors: colorScores[index] || 0
      };

      // Weighted sum (optional: can just sum them up)
      const totalScore = breakdown.name + breakdown.category + breakdown.description + breakdown.colors;

      return {
        ...transformProduct(product),
        score: totalScore,
        breakdown
      };
    });

    const topRecommendations = results
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    res.json(topRecommendations);

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
    const orders = await Order.find({
      'items.product': id,
      status: { $ne: 'cancelled' }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('items.product');

    if (orders.length === 0) {
      return res.json([]);
    }

    // 2. Extract co-occurring products
    const productFrequency = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        // Validation check for populated product
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

    // 3. Sort by frequency
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
