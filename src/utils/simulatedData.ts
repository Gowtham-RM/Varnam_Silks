import { products, mockUsers } from "@/data/mockData";
import { generateHistoricalOrders } from "@/utils/mockDataGenerator";

let cachedOrders: any[] | null = null;

export const getSimulatedData = () => {
    if (!cachedOrders) {
        cachedOrders = generateHistoricalOrders(products, mockUsers, 365);
    }

    const history = cachedOrders;
    const totalRevenue = history.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
    const totalOrders = history.length;
    const recentOrders = history.slice().reverse().slice(0, 5);
    const lowStockProductList = products.filter(p => p.stock < 3);

    return {
        historicalOrders: history,
        totalRevenue,
        totalOrders,
        recentOrders,
        lowStockProducts: lowStockProductList
    };
};
