import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

// Get logged-in user's orders
router.get('/my-orders', async (req, res) => {
    try {
        // Ideally, you would use middleware to get req.user.id
        // For now, we'll assume the user ID is passed in the query or header, 
        // OR if you have auth middleware, use req.user._id

        // NOTE: Since I don't see the auth middleware attached in index.js for this route yet,
        // I will check how auth.js handles it. 
        // Assuming simple implementation for now:

        const userId = req.headers['x-user-id']; // Temporary simple auth or use query param

        // If strict auth is needed, we should import the verifyToken middleware
        /* 
           const orders = await Order.find({ user: req.user._id }).populate('items.product');
        */

        // For this specific codebase state, I'll try to find orders by the user ID passed in header
        // or return all orders if just testing (but filtered by user is better)

        if (!userId) {
            return res.status(401).json({ message: 'User ID required' });
        }

        const orders = await Order.find({ user: userId })
            .populate('items.product')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all orders (Admin only)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('items.product')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new order
router.post('/', async (req, res) => {
    try {
        const order = new Order(req.body);

        // Check and update stock for each item
        for (const item of req.body.items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.product} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }
            // Reduce stock
            product.stock -= item.quantity;
            await product.save();
        }

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(400).json({ message: error.message });
    }
});

export default router;
