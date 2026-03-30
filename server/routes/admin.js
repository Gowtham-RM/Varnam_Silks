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

            // Low stock products (< 3)
            Product.find({ stock: { $lt: 3 } })
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

// Get sales predictions based on historical data
router.get('/sales-predictions', async (req, res) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Fetch historical orders from past 30 days
        const historicalOrders = await Order.find({
            createdAt: { $gte: thirtyDaysAgo },
            paymentStatus: 'paid'
        }).populate('items.product');

        if (!historicalOrders || historicalOrders.length === 0) {
            // Return empty structure if no historical data
            return res.json({
                predictedSales: { next7Days: [] },
                topSelling: [],
                lowDemand: [],
                recommendations: []
            });
        }

        // Aggregate daily sales over past 30 days
        const dailySales = {};
        historicalOrders.forEach(order => {
            const dateStr = order.createdAt.toISOString().split('T')[0];
            if (!dailySales[dateStr]) {
                dailySales[dateStr] = { count: 0, totalUnits: 0 };
            }
            dailySales[dateStr].count += 1;
            order.items.forEach(item => {
                dailySales[dateStr].totalUnits += item.quantity || 1;
            });
        });

        // Calculate average units sold per day
        const avgUnitsPerDay = Object.values(dailySales).reduce((sum, d) => sum + d.totalUnits, 0) / Object.keys(dailySales).length;

        // Generate 7-day forecast with realistic variation (±20%)
        const now = new Date();
        const next7Days = [];
        for (let i = 1; i <= 7; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Add realistic variation: ±20% with some randomness
            const variation = (Math.random() - 0.5) * 0.4; // -20% to +20%
            const predictedUnits = Math.round(avgUnitsPerDay * (1 + variation));
            
            next7Days.push({
                date: dateStr,
                units: Math.max(0, predictedUnits) // Ensure non-negative
            });
        }

        // Aggregate product sales to identify top-selling and low-demand products
        const productSales = {};
        historicalOrders.forEach(order => {
            order.items.forEach(item => {
                const productId = String(item.product._id);
                if (!productSales[productId]) {
                    productSales[productId] = {
                        name: item.product.name || 'Unknown',
                        image: (item.product.images && item.product.images[0]) || '',
                        totalSales: 0,
                        lastSaleDate: order.createdAt
                    };
                }
                productSales[productId].totalSales += item.quantity || 1;
                if (order.createdAt > productSales[productId].lastSaleDate) {
                    productSales[productId].lastSaleDate = order.createdAt;
                }
            });
        });

        // Convert to array and sort
        const productArray = Object.entries(productSales).map(([productId, data]) => ({
            productId,
            ...data
        }));

        const topSelling = productArray
            .sort((a, b) => b.totalSales - a.totalSales)
            .slice(0, 10);

        const lowDemand = productArray
            .sort((a, b) => a.totalSales - b.totalSales)
            .slice(0, 5);

        // Generate inventory recommendations
        const recommendations = await Promise.all(
            topSelling.map(async (product) => {
                const productDoc = await Product.findById(product.productId).select('name images stock');
                const predictedWeekSales = Math.round(avgUnitsPerDay * 7 * 1.1); // Expected sales next week
                const restockQty = Math.max(0, predictedWeekSales - (productDoc?.stock || 0));

                return {
                    productId: product.productId,
                    name: productDoc?.name || product.name,
                    image: productDoc?.images?.[0] || product.image,
                    currentStock: productDoc?.stock || 0,
                    predictedUnitsNextWeek: predictedWeekSales,
                    restockQty
                };
            })
        );

        res.json({
            predictedSales: { next7Days },
            topSelling,
            lowDemand,
            recommendations
        });
    } catch (error) {
        console.error('Error calculating sales predictions:', error);
        res.status(500).json({ 
            message: 'Error calculating sales predictions',
            predictedSales: { next7Days: [] },
            topSelling: [],
            lowDemand: [],
            recommendations: []
        });
    }
});

export default router;
