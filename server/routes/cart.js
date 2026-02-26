import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const router = express.Router();

// Middleware to mock authentication for now (since we don't have full auth middleware in this snippet)
// In a real app, you'd use a verifyToken middleware. 
// For this implementation, we'll assume the client sends userId in the body or header, 
// OR we can use the existing auth middleware if available.
// Looking at index.js, there is no global auth middleware applied.
// I'll assume we pass `userId` in the body for now to keep it simple, 
// or simpler: just require userId in requests.

// GET Cart
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart) {
            return res.json([]);
        }

        // Transform to match frontend structure
        const items = cart.items.map(item => {
            if (!item.productId) return null; // Handle deleted products
            return {
                id: item._id, // Cart item ID
                productId: item.productId._id,
                product: item.productId,
                quantity: item.quantity,
                size: item.size,
                color: item.color
            };
        }).filter(i => i !== null);

        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADD to Cart
router.post('/add', async (req, res) => {
    try {
        const { userId, productId, quantity, size, color } = req.body;

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId && item.size === size && item.color === color
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity, size, color });
        }

        await cart.save();

        // Return updated cart
        const updatedCart = await Cart.findById(cart._id).populate('items.productId');
        const items = updatedCart.items.map(item => ({
            id: item._id,
            productId: item.productId._id,
            product: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color
        }));

        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE Quantity
router.put('/update', async (req, res) => {
    try {
        const { userId, itemId, quantity } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const item = cart.items.id(itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        item.quantity = quantity;
        await cart.save();

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// REMOVE Item
router.post('/remove', async (req, res) => {
    try {
        const { userId, itemId } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items.pull(itemId);
        await cart.save();

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CLEAR Cart
router.post('/clear', async (req, res) => {
    try {
        const { userId } = req.body;
        await Cart.findOneAndDelete({ userId });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
