import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShoppingBag, DollarSign, AlertTriangle, Package, TrendingUp, Loader2, ArrowUpRight, ArrowDownRight, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { Product, Order } from '@/types';
import { toast } from 'sonner';


import { getSimulatedData } from '@/utils/simulatedData';
import { fetchRealAdminStats } from '@/services/adminService';
import { mockUsers } from '@/data/mockData';

interface LowStockVariant {
  id: string; // Product ID
  name: string;
  image: string;
  category: string;
  size: string;
  color: string;
  stock: number;
  variantId: string;
}

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
  lowStockProducts: LowStockVariant[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedLowStock, setExpandedLowStock] = useState<Record<string, boolean>>({});

  const toggleLowStock = (id: string) => {
    setExpandedLowStock(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // 1. Get Simulated Data (for Revenue & Charts consistency)
        const simData = getSimulatedData();

        // 2. Try to fetch Real Data
        let realStats = {
          totalUsers: 0,
          lowStockProducts: [] as LowStockVariant[],
          totalOrders: 0,
          totalRevenue: 0,
          recentOrders: [] as Order[]
        };
        let useRealData = false;

        try {
          const backendStats = await fetchRealAdminStats();
          realStats = {
            totalUsers: backendStats.totalUsers,
            lowStockProducts: backendStats.lowStockProducts,
            totalOrders: backendStats.totalOrders,
            totalRevenue: backendStats.totalRevenue,
            recentOrders: backendStats.recentOrders
          };
          useRealData = true;
        } catch (err) {
          console.warn("Backend API not available, falling back to mock data for Users/Stock", err);
        }

        // 3. Merge Data
        setStats({
          // Use Real Data if available, otherwise Simulated
          totalUsers: useRealData ? realStats.totalUsers : mockUsers.length,
          lowStockProducts: useRealData ? realStats.lowStockProducts : [], // No mock fallback for granular variants yet

          // Use Real Data for Totals if available
          totalOrders: useRealData ? realStats.totalOrders : simData.totalOrders,
          totalRevenue: useRealData ? realStats.totalRevenue : simData.totalRevenue,

          recentOrders: useRealData && realStats.recentOrders && realStats.recentOrders.length > 0 ? realStats.recentOrders : simData.recentOrders,
        });

      } catch (error) {
        console.error("Dashboard Error:", error);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
    const intervalId = setInterval(loadDashboardData, 2000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      trend: "+12% from last month",
      trendUp: true,
      color: "text-blue-600",
      gradient: "from-blue-50 to-white",
      link: undefined as string | undefined,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      trend: "+5% from last month",
      trendUp: true,
      color: "text-green-600",
      gradient: "from-green-50 to-white",
      link: '/admin/orders' as string | undefined,
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: "+8% from last month",
      trendUp: true,
      color: "text-purple-600",
      gradient: "from-purple-50 to-white",
      link: undefined as string | undefined,
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockProducts.length,
      icon: AlertTriangle,
      trend: stats.lowStockProducts.length > 0 ? "Action Needed" : "Inventory Healthy",
      trendUp: stats.lowStockProducts.length === 0,
      color: "text-orange-600",
      gradient: "from-orange-50 to-white",
      link: '/admin/analytics#stock-alerts' as string | undefined,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
            <p className="mt-1 text-slate-500">Welcome back to your admin control center.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
              <a href="/">View Store <ArrowUpRight className="ml-2 h-4 w-4" /></a>
            </Button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const cardEl = (
            <Card key={stat.title} className={cn("overflow-hidden transition-all hover:shadow-md border-slate-200 bg-gradient-to-br", stat.gradient, stat.link && "cursor-pointer")}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn('rounded-full p-2.5 bg-white shadow-sm ring-1 ring-slate-100')}>
                    <stat.icon className={cn('h-5 w-5', stat.color)} />
                  </div>
                  {stat.trendUp ?
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100"><TrendingUp className="h-3 w-3 mr-1" /> {stat.trend}</Badge>
                    : <Badge variant="secondary" className="bg-rose-100 text-rose-700 hover:bg-rose-100"><ArrowDownRight className="h-3 w-3 mr-1" /> {stat.trend}</Badge>
                  }
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-slate-500">{stat.title}</h3>
                  <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
            );
            return stat.link ? (
              <Link key={stat.title} to={stat.link} className="transition-transform hover:scale-[1.02]">{cardEl}</Link>
            ) : (
              <React.Fragment key={stat.title}>{cardEl}</React.Fragment>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent orders */}
          <Card className="overflow-hidden border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50">
              <div>
                <CardTitle className="font-serif text-lg">Recent Orders</CardTitle>
                <CardDescription>Latest transactions from customers</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                <Link to="/admin/orders">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                {stats.recentOrders.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No orders found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent sticky top-0 bg-white z-10 shadow-sm">
                        <TableHead className="w-[100px]">Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentOrders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id.slice(-6).toUpperCase()}</TableCell>
                          <TableCell className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={cn(
                                'capitalize font-normal',
                                order.status === 'delivered' && 'bg-green-100 text-green-700 hover:bg-green-100',
                                order.status === 'shipped' && 'bg-blue-100 text-blue-700 hover:bg-blue-100',
                                order.status === 'pending' && 'bg-amber-100 text-amber-700 hover:bg-amber-100',
                                order.status === 'processing' && 'bg-purple-100 text-purple-700 hover:bg-purple-100'
                              )}
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">₹{order.totalAmount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Low stock alerts */}
          <Card className="overflow-hidden border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50">
              <div>
                <CardTitle className="font-serif text-lg">Low Stock Alerts</CardTitle>
                <CardDescription>Items running low on inventory</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                <Link to="/admin/products">
                  Manage <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                {stats.lowStockProducts.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">All products are well stocked</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {Object.values(
                      stats.lowStockProducts.reduce((acc, item) => {
                        if (!acc[item.id]) {
                          acc[item.id] = { ...item, variants: [] };
                        }
                        acc[item.id].variants.push(item);
                        return acc;
                      }, {} as Record<string, any>)
                    ).map((group: any) => (
                      <div key={group.id} className="flex flex-col">
                        <div
                          className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => toggleLowStock(group.id)}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={group.image || 'https://placehold.co/100'}
                              alt={group.name}
                              className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <p className="text-sm font-medium line-clamp-1 text-slate-700">{group.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {group.category} • {group.variants.length} variant{group.variants.length !== 1 ? 's' : ''} low stock
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-xs font-normal',
                                group.variants.some((v: any) => v.stock === 0)
                                  ? 'bg-red-100 text-red-700 hover:bg-red-100'
                                  : 'bg-orange-100 text-orange-700 hover:bg-orange-100'
                              )}
                            >
                              {group.variants.some((v: any) => v.stock === 0) ? 'Out of Stock' : 'Low Stock'}
                            </Badge>
                            {expandedLowStock[group.id] ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                          </div>
                        </div>
                        {expandedLowStock[group.id] && (
                          <div className="bg-slate-50/50 p-2 pl-14 divide-y divide-slate-100 border-t border-slate-100">
                            {group.variants.map((variant: any) => (
                              <div key={variant.variantId} className="flex items-center justify-between py-2 text-sm">
                                <span className="text-slate-600">
                                  {variant.size !== 'N/A' && <span className="font-medium">{variant.size}</span>}
                                  {variant.size !== 'N/A' && variant.color !== 'N/A' && ' • '}
                                  {variant.color !== 'N/A' && <span>{variant.color}</span>}
                                  {variant.size === 'N/A' && variant.color === 'N/A' && 'Default'}
                                </span>
                                <span className={cn(
                                  "font-medium",
                                  variant.stock === 0 ? "text-red-600" : "text-orange-600"
                                )}>
                                  {variant.stock === 0 ? '0 left' : `${variant.stock} left`}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        {/* Quick actions */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-slate-800">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/admin/products/new"
              className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-rose-200 hover:shadow-md hover:shadow-rose-100"
            >
              <div className="p-3 rounded-full bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-100">
                <Package className="h-6 w-6" />
              </div>
              <span className="font-medium text-slate-700 group-hover:text-rose-700">Add Product</span>
            </Link>
            <Link
              to="/admin/orders"
              className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-md hover:shadow-blue-100"
            >
              <div className="p-3 rounded-full bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <span className="font-medium text-slate-700 group-hover:text-blue-700">View Orders</span>
            </Link>
            <Link
              to="/admin/analytics"
              className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-purple-200 hover:shadow-md hover:shadow-purple-100"
            >
              <div className="p-3 rounded-full bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-100">
                <TrendingUp className="h-6 w-6" />
              </div>
              <span className="font-medium text-slate-700 group-hover:text-purple-700">Analytics</span>
            </Link>
            <Link
              to="/admin/users"
              className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-orange-200 hover:shadow-md hover:shadow-orange-100"
            >
              <div className="p-3 rounded-full bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-100">
                <Users className="h-6 w-6" />
              </div>
              <span className="font-medium text-slate-700 group-hover:text-orange-700">Manage Users</span>
            </Link>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
