import { Order, Product } from "@/types";
import { format, subDays, addDays, getDay, parseISO, isAfter } from 'date-fns';

export interface DailyRevenue {
    date: string;
    revenue: number;
    orders: number;
}

export interface ProductInsight {
    product: Product;
    score: number;
    trend: 'up' | 'down' | 'stable';
    totalSales: number;
    totalRevenue: number;
}

const getOrderItems = (order: Order) => {
    const legacyItems = order.orderItems;
    const backendItems = (order as any).items;
    return Array.isArray(legacyItems) ? legacyItems : (Array.isArray(backendItems) ? backendItems : []);
};

// 1. Calculate Daily Revenue (Last 30 days)
export const getRevenueAnalytics = (orders: Order[], days = 30): DailyRevenue[] => {
    const result: Record<string, DailyRevenue> = {};
    const today = new Date();
    const startDate = subDays(today, days);

    // Initialize all days with 0
    for (let i = 0; i <= days; i++) {
        const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
        result[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
    }

    // Aggregate orders
    orders.forEach(order => {
        const orderDate = parseISO(order.createdAt);
        if (isAfter(orderDate, startDate)) {
            const dateStr = format(orderDate, 'yyyy-MM-dd');
            if (result[dateStr]) {
                result[dateStr].revenue += order.totalAmount;
                result[dateStr].orders += 1;
            }
        }
    });

    return Object.values(result).sort((a, b) => a.date.localeCompare(b.date));
};


// 2. Simple Linear Regression for Revenue Forecast
export const predictRevenue = (data: DailyRevenue[], forecastDays = 7) => {
    // x = day index, y = revenue
    const n = data.length;
    if (n < 2) return [];

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    data.forEach((point, i) => {
        sumX += i;
        sumY += point.revenue;
        sumXY += i * point.revenue;
        sumXX += i * i;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate forecast
    const forecast: DailyRevenue[] = [];
    const lastDate = parseISO(data[data.length - 1].date);

    for (let i = 1; i <= forecastDays; i++) {
        const nextDate = addDays(lastDate, i);
        const predictedRevenue = Math.max(0, slope * (n + i) + intercept); // Ensure non-negative

        // Add some random variance to make it look realistic (simulating daily fluctuation)
        const variance = predictedRevenue * 0.1 * (Math.random() - 0.5);

        forecast.push({
            date: format(nextDate, 'yyyy-MM-dd'),
            revenue: Math.round(predictedRevenue + variance),
            orders: 0 // We predict revenue, orders is harder
        });
    }

    return forecast;
};

// 3. Trending Products (Sales Volume + recent activity)
export const getTrendingProducts = (orders: Order[], products: Product[], limit = 5): ProductInsight[] => {
    const salesCount: Record<string, number> = {};
    const revenueCount: Record<string, number> = {};
    const recentSalesCount: Record<string, number> = {};
    const today = new Date();
    const recentThreshold = subDays(today, 7); // Last 7 days considered "recent trend"

    orders.forEach(order => {
        const items = getOrderItems(order);
        if (!items.length) return;
        
        const orderDate = parseISO(order.createdAt);
        const isRecent = isAfter(orderDate, recentThreshold);

        items.forEach(item => {
            // Try multiple ID fields to handle different backend formats
            const productId = item.productId || item.product?.id || item.product?._id;
            if (!productId) return;
            
            const quantity = item.quantity || 1;
            const price = item.price || item.product?.price || 0;
            
            salesCount[productId] = (salesCount[productId] || 0) + quantity;
            revenueCount[productId] = (revenueCount[productId] || 0) + (quantity * price);
            
            if (isRecent) {
                recentSalesCount[productId] = (recentSalesCount[productId] || 0) + quantity;
            }
        });
    });

    // Calculate score: Total Sales + (Recent Sales * 3) -> weighting recency higher
    const insights: ProductInsight[] = products.map(p => {
        // Match against multiple possible ID formats
        const productId = p.id || (p as any)._id;
        const total = salesCount[productId] || 0;
        const recent = recentSalesCount[productId] || 0;
        const score = total + (recent * 3);
        const totalRevenue = revenueCount[productId] || (total * p.price);

        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (recent > total / 10 && total > 0) trend = 'up';
        else if (recent === 0 && total > 0) trend = 'down';
        else if (recent > 0) trend = 'up';

        return {
            product: p,
            score,
            trend,
            totalSales: total,
            totalRevenue
        };
    });

    // Sort by total sales, then by score if sales are equal
    return insights
        .sort((a, b) => {
            if (b.totalSales !== a.totalSales) return b.totalSales - a.totalSales;
            return b.score - a.score;
        })
        .slice(0, limit);
};

// 4. Low Stock Alerts
export const getLowStockProducts = (products: Product[], threshold = 3): Product[] => {
    return products.filter(p => p.stock < threshold);
};

// 5. Product Associations (Apriori Light - "Bought Together")
export const getProductAssociations = (orders: Order[], targetProductId: string): string[] => {
    const associatedCounts: Record<string, number> = {};

    orders.forEach(order => {
        const items = getOrderItems(order);
        if (!items.length) return;
        
        // Check if order contains target product
        const hasTarget = items.some(item => item.productId === targetProductId || item.product?.id === targetProductId || item.product?._id === targetProductId);
        if (hasTarget) {
            items.forEach(item => {
                const productId = item.productId || item.product?.id || item.product?._id;
                if (productId && productId !== targetProductId) {
                    associatedCounts[productId] = (associatedCounts[productId] || 0) + 1;
                }
            });
        }
    });

    // Return top 3 associated product IDs
    return Object.entries(associatedCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([id]) => id);
}

// 6. Seasonal/Category Demand (Pie Chart Data)
export const getCategoryDemand = (orders: Order[]) => {
    const categoryCounts: Record<string, number> = {};

    orders.forEach(order => {
        const items = getOrderItems(order);
        if (!items.length) return;
        
        items.forEach(item => {
            if (!item.product || !item.product.category) return;
            const cat = item.product.category;
            categoryCounts[cat] = (categoryCounts[cat] || 0) + item.quantity;
        });
    });

    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
}

// 6. Monthly Analytics (Jan-Dec)
export interface MonthlyAnalytics {
    name: string; // "Jan", "Feb", etc.
    revenue: number;
    orders: number;
}

export const getMonthlyAnalytics = (orders: Order[]): MonthlyAnalytics[] => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize
    const monthlyData = months.map(m => ({ name: m, revenue: 0, orders: 0 }));

    orders.forEach(order => {
        const date = new Date(order.createdAt);
        const monthIndex = date.getMonth();

        monthlyData[monthIndex].revenue += order.totalAmount;
        monthlyData[monthIndex].orders += 1;
    });

    return monthlyData;
};
