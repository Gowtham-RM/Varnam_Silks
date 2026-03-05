import { useEffect, useMemo, useState } from "react";
import { getSimulatedData } from '@/utils/simulatedData';
import { fetchRealAdminStats } from '@/services/adminService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { products as mockProducts, mockUsers } from "@/data/mockData";
import { generateHistoricalOrders } from "@/utils/mockDataGenerator";
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
    } | null>(null);

    useEffect(() => {
        const loadAnalytics = async () => {
            // Get shared history (Simulated)
            const history = getSimulatedData().historicalOrders;

            // Try to get real products
            let currentProducts = mockProducts;
            let lowStockFromBackend: any[] = [];
            try {
                const stats = await fetchRealAdminStats();
                if (stats.products && stats.products.length > 0) {
                    currentProducts = stats.products;
                }
                // If real data is available, use the pre-calculated low stock alerts from adminService
                if (stats.lowStockProducts) {
                    lowStockFromBackend = stats.lowStockProducts;
                }
            } catch (e) {
                console.warn("Failed to load real products for analytics", e);
            }

            const revenue = getRevenueAnalytics(history, 30);
            const forecast = predictRevenue(revenue, 7);
            const trending = getTrendingProducts(history, currentProducts);

            // Use backend low stock logic if available, otherwise fall back to frontend calculation (which doesn't handle variants as well yet)
            const lowStock = lowStockFromBackend.length > 0 ? lowStockFromBackend : getLowStockProducts(currentProducts, 3);
            const categoryData = getCategoryDemand(history);
            const monthlyData = getMonthlyAnalytics(history);

            // Calc totals
            const totalRev = revenue.reduce((sum, d) => sum + d.revenue, 0);
            const predRev = forecast.reduce((sum, d) => sum + d.revenue, 0);

            setAnalyticsData({
                revenueData: revenue,
                forecastData: forecast,
                trending,
                lowStock,
                categoryData,
                monthlyData,
                totalRevenue: totalRev,
                predictedRevenue: predRev
            });
        };

        loadAnalytics();
    }, []);

    if (!analyticsData) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <div className="animate-spin text-primary">Loading AI Insights...</div>
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">30-Day Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{analyticsData.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Predicted Revenue (7d)</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">₹{analyticsData.predictedRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">AI Estimate based on recent trends</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.lowStock.length}</div>
                        <p className="text-xs text-muted-foreground">Products need restocking</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.categoryData.reduce((acc, curr) => acc + curr.value, 0)}</div>
                        <p className="text-xs text-muted-foreground">Across {analyticsData.categoryData.length} categories</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="md:col-span-4">
                    <CardHeader>
                        <CardTitle className="font-serif tracking-wide uppercase text-sm font-semibold">Monthly Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2 w-full min-w-0">
                        <ChartContainer config={revenueChartConfig} className="h-[300px] w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%">
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

                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle className="font-serif tracking-wide uppercase text-sm font-semibold">Orders Per Month</CardTitle>
                    </CardHeader>
                    <CardContent className="w-full min-w-0">
                        <div className="h-[300px] w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%">
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
                    <CardHeader>
                        <CardTitle className="font-serif tracking-wide uppercase text-sm font-semibold">Top Performing Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {analyticsData.trending.map((item, i) => (
                                <div key={item.product.id} className="relative">
                                    <div className="flex items-center justify-between mb-2 text-sm">
                                        <div className="flex items-center gap-4">
                                            <span className="text-muted-foreground w-2">{i + 1}</span>
                                            <span className="font-medium text-gray-700">{item.product.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold">{item.totalSales} sold</div>
                                            <div className="text-xs text-muted-foreground">₹{item.totalRevenue.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    {/* Progress Bar Background */}
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        {/* Progress Bar Foreground - using relative width based on top performer */}
                                        <div
                                            className="h-full bg-black rounded-full"
                                            style={{
                                                width: `${(item.totalSales / analyticsData.trending[0].totalSales) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
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
                <Card>
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
