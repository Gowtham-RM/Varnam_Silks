import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getSimulatedData } from '@/utils/simulatedData';
import { fetchRealAdminStats } from '@/services/adminService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { products as mockProducts, mockUsers } from "@/data/mockData";
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import {
    getRevenueAnalytics,
    predictRevenue,
    getTrendingProducts,
    getLowStockProducts,
    getCategoryDemand,
    getMonthlyAnalytics,
    ProductInsight,
    DailyRevenue,
    MonthlyAnalytics
} from "@/utils/analytics";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Area, AreaChart, PieChart, Pie, Cell
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, AlertTriangle, Package, DollarSign, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// Chart configurations for shadcn/ui charts
const revenueChartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--primary))" },
    predicted: { label: "Forecast", color: "hsl(var(--muted-foreground))" },
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];



const SmartInsights = () => {
    const [analyticsData, setAnalyticsData] = useState<{
        revenueData: DailyRevenue[];
        forecastData: DailyRevenue[];
        trending: ProductInsight[];
        lowStock: any[];
        categoryData: any[];
        monthlyData: MonthlyAnalytics[];
        totalRevenue: number;
        predictedRevenue: number;
        activeProductsCount: number;
        activeCategoriesCount: number;
    } | null>(null);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                // Fetch real orders from backend
                const ordersResponse = await api.get('/orders');
                const backendOrders = ordersResponse.data || [];
                
                // Ensure orders are in the shape expected by analytics utils
                const history = backendOrders.map((order: any) => ({
                    ...order,
                    id: order._id || order.id,
                    date: order.createdAt // map createdAt to date for compatibility with some utils
                }));

                // Try to get real products
                let currentProducts = mockProducts;
                let lowStockFromBackend: any[] = [];
                try {
                    const stats = await fetchRealAdminStats();
                    if (stats.products && stats.products.length > 0) {
                        currentProducts = stats.products;
                    }
                    if (stats.lowStockProducts) {
                        lowStockFromBackend = stats.lowStockProducts;
                    }
                } catch (e) {
                    console.warn("Failed to load real products for analytics", e);
                }

                const revenue = getRevenueAnalytics(history, 30);
                const forecast = predictRevenue(revenue, 7);
                const trending = getTrendingProducts(history, Array.isArray(currentProducts) ? currentProducts : []);

            // Use backend low stock logic if available, otherwise fall back to frontend calculation (which doesn't handle variants as well yet)
            const lowStock = lowStockFromBackend.length > 0 ? lowStockFromBackend : getLowStockProducts(Array.isArray(currentProducts) ? currentProducts : [], 3);
            const categoryData = getCategoryDemand(history);
            const monthlyData = getMonthlyAnalytics(history);

                // Calc totals
                const totalRev = revenue.reduce((sum, d) => sum + d.revenue, 0);
                const predRev = forecast.reduce((sum, d) => sum + d.revenue, 0);
                const uniqueCategories = new Set(
                    (Array.isArray(currentProducts) ? currentProducts : [])
                        .filter(p => p && p.category)
                        .map(p => p.category)
                );

                setAnalyticsData({
                    revenueData: revenue,
                    forecastData: forecast,
                    trending,
                    lowStock,
                    categoryData,
                    monthlyData,
                    totalRevenue: totalRev,
                    predictedRevenue: predRev,
                    activeProductsCount: Array.isArray(currentProducts) ? currentProducts.length : 0,
                    activeCategoriesCount: uniqueCategories.size
                });
            } catch (error) {
                console.error("Failed to load analytics:", error);
                // Fallback state if api fails
            }
        };

        loadAnalytics();
        // Refresh analytics every 30 seconds instead of 2 seconds to prevent overload
        const intervalId = setInterval(loadAnalytics, 30000);
        return () => clearInterval(intervalId);
    }, []);

    if (!analyticsData) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading AI Insights...</p>
                </div>
            </div>
        );
    }

    // Merge revenue and forecast for main chart
    const combinedRevenueData = [
        ...analyticsData.revenueData,
        ...analyticsData.forecastData.map(d => ({ ...d, isForecast: true }))
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Stats Cards - Sticky on mobile for easy access while scrolling */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 sticky top-16 md:top-0 bg-background/95 backdrop-blur-sm z-10 py-4 -mt-4 border-b md:border-0">
                <Link to="/admin/orders" className="transition-transform hover:scale-[1.02]">
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">30-Day Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{analyticsData.totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/admin/analytics" className="transition-transform hover:scale-[1.02]">
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-primary/20 bg-primary/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Predicted Revenue (7d)</CardTitle>
                            <Activity className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">₹{analyticsData.predictedRevenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">AI Estimate based on recent trends</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/admin/products" className="transition-transform hover:scale-[1.02]">
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analyticsData.lowStock.length}</div>
                            <p className="text-xs text-muted-foreground">Products need restocking</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/admin/products" className="transition-transform hover:scale-[1.02]">
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analyticsData.activeProductsCount}</div>
                            <p className="text-xs text-muted-foreground">Across {analyticsData.activeCategoriesCount} categories</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="md:col-span-4 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="font-serif tracking-wide uppercase text-sm font-semibold">Monthly Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2 w-full min-w-0 overflow-x-auto">
                        <ChartContainer config={revenueChartConfig} className="h-[300px] w-full min-w-[300px]">
                            <ResponsiveContainer width="99%" height="100%">
                                <AreaChart data={analyticsData.monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        padding={{ left: 15, right: 15 }}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                    />
                                    <YAxis
                                        tickFormatter={(value) => `₹${(value / 1000).toFixed(1)}k`}
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        width={60}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#000000"
                                        fill="#E5E7EB"
                                        fillOpacity={0.4}
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="font-serif tracking-wide uppercase text-sm font-semibold">Orders Per Month</CardTitle>
                    </CardHeader>
                    <CardContent className="w-full min-w-0 overflow-x-auto">
                        <div className="h-[300px] w-full min-w-[300px]">
                            <ResponsiveContainer width="99%" height="100%">
                                <BarChart data={analyticsData.monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        padding={{ left: 15, right: 15 }}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        width={40}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar
                                        dataKey="orders"
                                        fill="#111827"
                                        radius={[4, 4, 0, 0]}
                                        barSize={32}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="font-serif tracking-wide uppercase text-sm font-semibold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                            Top Performing Products
                        </CardTitle>
                        <CardDescription className="text-xs">Best sellers by total units sold</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {analyticsData.trending.length > 0 && analyticsData.trending[0].totalSales > 0 ? (
                            <div className="space-y-4">
                                {analyticsData.trending.map((item, i) => {
                                    const maxSales = Math.max(analyticsData.trending[0].totalSales, 1);
                                    const percentage = (item.totalSales / maxSales) * 100;
                                    
                                    return (
                                        <div key={item.product.id || i} className="group hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <span className="font-bold text-lg text-slate-400 w-6 flex-shrink-0">#{i + 1}</span>
                                                    <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                                        <img 
                                                            src={item.product.images?.[0] || 'https://placehold.co/100'} 
                                                            alt={item.product.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm text-slate-800 truncate" title={item.product.name}>
                                                            {item.product.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {item.product.category}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-bold text-slate-900">{item.totalSales}</span>
                                                        <span className="text-xs text-muted-foreground">units</span>
                                                        {item.trend === 'up' && (
                                                            <TrendingUp className="h-3 w-3 text-emerald-600 ml-1" />
                                                        )}
                                                    </div>
                                                    <div className="text-xs font-medium text-emerald-700">
                                                        ₹{item.totalRevenue.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden ml-9">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-500",
                                                        i === 0 ? "bg-gradient-to-r from-emerald-500 to-emerald-600" :
                                                        i === 1 ? "bg-gradient-to-r from-blue-500 to-blue-600" :
                                                        i === 2 ? "bg-gradient-to-r from-amber-500 to-amber-600" :
                                                        "bg-slate-400"
                                                    )}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-3">
                                    <Package className="h-8 w-8 text-slate-400" />
                                </div>
                                <p className="text-sm font-medium text-slate-700">No Sales Data Yet</p>
                                <p className="text-xs text-muted-foreground mt-1">Products will appear here once orders are placed</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-serif tracking-wide uppercase text-sm font-semibold">Sales by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="w-full min-w-0">
                        <div className="h-[300px] w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analyticsData.categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {analyticsData.categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap justify-center gap-2 mt-2">
                                {analyticsData.categoryData.map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-1 text-[10px]">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span>{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <Card id="stock-alerts">
                    <CardHeader>
                        <CardTitle>Stock Alerts</CardTitle>
                        <CardDescription>Items running low on inventory</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-2">
                            {analyticsData.lowStock.map((item) => (
                                <div key={item.variantId || item.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={item.image || 'https://placehold.co/100'}
                                            alt={item.name}
                                            className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200"
                                        />
                                        <div>
                                            <p className="text-sm font-medium line-clamp-1 text-slate-700">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.size && item.size !== 'N/A' && <span className="font-medium text-slate-600">{item.size} • {item.color}</span>}
                                                {(!item.size || item.size === 'N/A') && <span className="capitalize">{item.category}</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700 transition-colors">
                                            {item.stock === 0 ? 'Out' : `${item.stock} left`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {analyticsData.lowStock.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">All products are well stocked</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SmartInsights;
