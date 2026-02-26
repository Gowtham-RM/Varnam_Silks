import { Order, OrderItem, Product, User } from '@/types';
import { subDays, addDays, format, getDay } from 'date-fns';

// Helper to get random item from array
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to get random int
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateHistoricalOrders = (products: Product[], users: User[], count: number = 200): Order[] => {
    const orders: Order[] = [];
    const today = new Date();

    // Seasonal/Trend weights (mocking patterns)
    // Weekends have higher sales
    // "Festive" period 30-60 days ago

    for (let i = 0; i < count; i++) {
        // Generate dates mostly within last 90 days, with some concentration
        const daysAgo = getRandomInt(0, 365);
        const orderDate = subDays(today, daysAgo);

        // Simulate higher demand on weekends
        const dayOfWeek = getDay(orderDate);
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // Skip some weekdays to make data look realistic (lower volume)
        if (!isWeekend && Math.random() > 0.6) continue;

        const user = getRandom(users);

        // Create random order items
        const itemCount = getRandomInt(1, 4);
        const orderItems: OrderItem[] = [];
        let totalAmount = 0;

        for (let j = 0; j < itemCount; j++) {
            const product = getRandom(products);
            const quantity = getRandomInt(1, 2);

            // Handle the data structure found in mockData.ts (strings) vs types (objects)
            // Safety check to avoid crashes
            const size = Array.isArray(product.sizes) && typeof product.sizes[0] === 'string'
                ? getRandom(product.sizes as any as string[])
                : (product.sizes[0] as any)?.size || 'M';

            const color = Array.isArray(product.colors) && typeof product.colors[0] === 'string'
                ? getRandom(product.colors as any as string[])
                : (product.colors?.[0] as any) || 'Black';

            orderItems.push({
                productId: product.id,
                product: product,
                quantity,
                size: size,
                color: color,
                price: product.price
            });
            totalAmount += product.price * quantity;
        }

        orders.push({
            id: `ORD-HIST-${i + 1000}`,
            userId: user.id || 'guest',
            orderItems,
            totalAmount,
            paymentStatus: 'paid', // Historical orders are mostly paid
            orderStatus: 'delivered',
            shippingAddress: {
                street: '123 Test St',
                city: 'Test City',
                state: 'TS',
                zipCode: '12345',
                country: 'India'
            },
            paymentMethod: 'card',
            createdAt: orderDate.toISOString(),
            updatedAt: orderDate.toISOString()
        });
    }

    return orders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};
