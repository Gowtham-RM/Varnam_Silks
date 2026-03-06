// server/routes/analytics.js
import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

// Helper: Linear regression (ordinary least squares)
function linearRegression(points) {
    const n = points.length;
    if (n === 0) return { slope: 0, intercept: 0 };
    let sumX = 0,
        sumY = 0,
        sumXY = 0,
        sumX2 = 0;
    for (const { x, y } of points) {
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
    }
    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) return { slope: 0, intercept: sumY / n };
    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
}

// Aggregate daily sales per product
async function getDailySales() {
    // Fetch all completed orders
    const orders = await Order.find({ paymentStatus: 'paid' }).select('createdAt items');
    const salesMap = {}; // { productId: { dateString: units } }
    for (const order of orders) {
        if (!order.createdAt) continue;
        const date = new Date(order.createdAt);
        if (isNaN(date.getTime())) continue; // Ensure the date is valid before using it
        const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        for (const item of order.items) {
            if (!item.product) continue;
            const pid = item.product.toString();
            const qty = item.quantity;
            if (!salesMap[pid]) salesMap[pid] = {};
            salesMap[pid][dayKey] = (salesMap[pid][dayKey] || 0) + qty;
        }
    }
    return salesMap;
}

// Generate forecasts for a product
function forecast(productSales, daysAhead) {
    // Convert salesMap (date->units) to sorted array of points
    const dates = Object.keys(productSales).sort();
    
    // If there is no sales history, return zero predictions
    if (dates.length === 0) {
        const forecasts = [];
        const today = new Date();
        for (let i = 1; i <= daysAhead; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() + i);
            forecasts.push({ date: d.toISOString().split('T')[0], units: 0 });
        }
        return forecasts;
    }

    const points = dates.map((dateStr, idx) => ({ x: idx, y: productSales[dateStr] }));
    const { slope, intercept } = linearRegression(points);
    const lastIdx = dates.length - 1;
    const forecasts = [];
    for (let i = 1; i <= daysAhead; i++) {
        const x = lastIdx + i;
        const y = Math.max(0, Math.round(slope * x + intercept));
        let forecastDate = new Date(dates[dates.length - 1]);
        if (isNaN(forecastDate.getTime())) forecastDate = new Date(); // Fallback if Invalid Date
        forecastDate.setDate(forecastDate.getDate() + i);
        forecasts.push({ date: forecastDate.toISOString().split('T')[0], units: y });
    }
    return forecasts;
}

router.get('/sales-predictions', async (req, res) => {
    try {
        const [salesMap, products] = await Promise.all([
            getDailySales(),
            Product.find().select('name stock images'),
        ]);

        const productMap = {};
        for (const p of products) {
            productMap[p._id.toString()] = p;
        }

        const topSelling = [];
        const lowDemand = [];
        const recommendations = [];
        const predictedSales = { next7Days: [], next30Days: [] };

        // Compute total sales per product for ranking
        const totalSalesArr = [];
        for (const pid in salesMap) {
            const total = Object.values(salesMap[pid]).reduce((a, b) => a + b, 0);
            totalSalesArr.push({ pid, total });
        }
        totalSalesArr.sort((a, b) => b.total - a.total);
        
        topSelling.push(...totalSalesArr.slice(0, 5).map(t => {
            const p = productMap[t.pid];
            return { 
                productId: t.pid, 
                totalSales: t.total,
                name: p ? p.name : 'Unknown Product',
                image: p && p.images && p.images.length > 0 ? p.images[0] : ''
            };
        }));
        
        lowDemand.push(...totalSalesArr.slice(-5).map(t => {
            const p = productMap[t.pid];
            return { 
                productId: t.pid, 
                totalSales: t.total,
                name: p ? p.name : 'Unknown Product',
                image: p && p.images && p.images.length > 0 ? p.images[0] : ''
            };
        }));

        // Forecasts per product
        for (const product of products) {
            const pid = product._id.toString();
            const daily = salesMap[pid] || {};
            const forecast7 = forecast(daily, 7);
            const forecast30 = forecast(daily, 30);
            // aggregate weekly total
            const weeklyTotal = forecast7.reduce((sum, f) => sum + f.units, 0);
            const restockQty = Math.max(0, weeklyTotal - (product.stock || 0));
            recommendations.push({
                productId: pid,
                name: product.name,
                image: product.images && product.images.length > 0 ? product.images[0] : '',
                predictedUnitsNextWeek: weeklyTotal,
                currentStock: product.stock || 0,
                restockQty,
            });
            // push to overall predictions (optional: combine all products)
            predictedSales.next7Days.push(...forecast7.map(f => ({ ...f, productId: pid })));
            predictedSales.next30Days.push(...forecast30.map(f => ({ ...f, productId: pid })));
        }

        // Sort recommendations descending by restock quantity, then descending by predicted demand
        recommendations.sort((a, b) => {
            if (b.restockQty !== a.restockQty) return b.restockQty - a.restockQty;
            return b.predictedUnitsNextWeek - a.predictedUnitsNextWeek;
        });

        res.json({
            predictedSales,
            topSelling,
            lowDemand,
            recommendations,
        });
    } catch (err) {
        console.error('Error in sales predictions:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
