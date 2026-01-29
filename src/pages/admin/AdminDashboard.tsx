import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ShoppingBag, DollarSign, AlertTriangle, Package, TrendingUp } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { products, mockOrders, mockUsers } from '@/data/mockData';
import { cn } from '@/lib/utils';

const AdminDashboard: React.FC = () => {
  const totalUsers = mockUsers.filter((u) => !u.isAdmin).length;
  const totalOrders = mockOrders.length;
  const totalRevenue = mockOrders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const lowStockProducts = products.filter((p) => p.stock < 10);

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingBag,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Welcome to your admin dashboard</p>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={cn('rounded-lg p-3', stat.bgColor)}>
                    <stat.icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-lg">Recent Orders</CardTitle>
              <Link to="/admin/orders" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{order.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">₹{order.totalAmount.toLocaleString()}</p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'capitalize text-xs',
                          order.orderStatus === 'delivered' && 'bg-green-100 text-green-800',
                          order.orderStatus === 'shipped' && 'bg-purple-100 text-purple-800',
                          order.orderStatus === 'pending' && 'bg-yellow-100 text-yellow-800'
                        )}
                      >
                        {order.orderStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low stock alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-lg">Low Stock Alerts</CardTitle>
              <Link to="/admin/products" className="text-sm text-primary hover:underline">
                Manage Products
              </Link>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">All products are well stocked</p>
              ) : (
                <div className="space-y-4">
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {product.category}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs',
                          product.stock === 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                        )}
                      >
                        {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                to="/admin/products/new"
                className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
              >
                <Package className="h-5 w-5 text-primary" />
                <span className="font-medium">Add Product</span>
              </Link>
              <Link
                to="/admin/orders"
                className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
              >
                <ShoppingBag className="h-5 w-5 text-primary" />
                <span className="font-medium">View Orders</span>
              </Link>
              <Link
                to="/admin/products"
                className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
              >
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="font-medium">Manage Inventory</span>
              </Link>
              <Link
                to="/"
                className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
              >
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">View Store</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
