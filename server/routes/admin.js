import express from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

// Get admin stats
router.get('/stats', async (req, res) => {
    try {
        // Parallel data fetching for performance
        const [
            usersCount,
            ordersCount,
            revenueData,
            recentOrders,
            lowStockProducts
        ] = await Promise.all([
            // Total non-admin users
            User.countDocuments({ role: { $ne: 'admin' } }),

            // Total orders
            Order.countDocuments(),

            // Total revenue (sum of totalAmount for paid orders)
            Order.aggregate([
                { $match: { paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),

            // Recent orders (last 5)
            Order.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('items.product', 'name images')
                .populate('user', 'email'),

            // Low stock products (< 10)
            Product.find({ stock: { $lt: 10 } })
                .limit(5)
                .select('name category stock images')
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        res.json({
            totalUsers: usersCount,
            totalOrders: ordersCount,
            totalRevenue,
            recentOrders,
            lowStockProducts
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

export default router;
