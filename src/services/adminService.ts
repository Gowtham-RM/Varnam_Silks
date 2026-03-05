import api from '@/lib/api';
import { Product } from '@/types';

export const fetchRealAdminStats = async () => {
    try {
        // Parallel fetch: Stats summary AND full products list
        const [statsResponse, productsResponse] = await Promise.all([
            api.get('/admin/stats'),
            api.get('/products')
        ]);

        const statsData = statsResponse.data;
        const productsData = productsResponse.data;

        // Calculate variant-level low stock (threshold <= 3)
        const lowStockSummary: any[] = [];
        productsData.forEach((product: any) => {
            if (product.sizes && Array.isArray(product.sizes)) {
                product.sizes.forEach((sizeObj: any) => {
                    if (sizeObj.colors && Array.isArray(sizeObj.colors)) {
                        sizeObj.colors.forEach((colorObj: any) => {
                            if (colorObj.stock < 3) {
                                lowStockSummary.push({
                                    id: product._id || product.id,
                                    name: product.name,
                                    image: product.images?.[0] || '',
                                    category: product.category,
                                    size: sizeObj.size,
                                    color: colorObj.color,
                                    stock: colorObj.stock,
                                    variantId: `${product._id || product.id}-${sizeObj.size}-${colorObj.color}`
                                });
                            }
                        });
                    }
                });
            } else if (product.stock < 3) {
                // Fallback for products without variants
                const productId = product._id || product.id;
                lowStockSummary.push({
                    id: productId,
                    name: product.name,
                    image: product.images?.[0] || '',
                    category: product.category,
                    size: 'N/A',
                    color: 'N/A',
                    stock: product.stock,
                    variantId: productId
                });
            }
        });

        // /products endpoint already transforms _id -> id in the backend (server/routes/products.js)
        const allProducts = productsData;

        // Transform recentOrders keys
        const recentOrders = statsData.recentOrders.map((order: any) => ({
            ...order,
            id: order._id || order.id
        }));

        return {
            totalUsers: statsData.totalUsers,
            totalOrders: statsData.totalOrders, // Real total orders
            totalRevenue: statsData.totalRevenue, // Real total revenue
            lowStockProducts: lowStockSummary, // Now contains variant details
            products: allProducts as Product[], // Real full product list
            recentOrders: recentOrders,
            rawStats: statsData
        };
    } catch (error) {
        console.error('Failed to fetch real admin stats:', error);
        throw error;
    }
};
