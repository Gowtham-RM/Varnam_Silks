import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockOrders } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const Orders: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // Filter orders for current user (in production, this would be fetched from API)
  const userOrders = mockOrders.filter((order) => order.userId === user?.id || order.userId === '1');

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-2xl font-semibold">Please Sign In</h1>
          <p className="mt-2 text-muted-foreground">Sign in to view your orders</p>
          <Link to="/login" className="mt-6 inline-block">
            <Button variant="hero">Sign In</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="font-display text-3xl font-semibold">My Orders</h1>
        <p className="mt-2 text-muted-foreground">Track and manage your orders</p>

        {userOrders.length === 0 ? (
          <div className="mt-12 text-center">
            <Package className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 font-display text-xl font-semibold">No Orders Yet</h2>
            <p className="mt-2 text-muted-foreground">
              Start shopping to see your orders here
            </p>
            <Link to="/shop" className="mt-6 inline-block">
              <Button variant="hero">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {userOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                {/* Order header */}
                <div className="flex flex-col gap-4 border-b border-border bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-medium">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-semibold">₹{order.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn('capitalize', statusColors[order.orderStatus])}>
                      {order.orderStatus}
                    </Badge>
                    <Badge className={cn('capitalize', paymentColors[order.paymentStatus])}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                {/* Order items */}
                <div className="p-4">
                  <div className="space-y-4">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <Link
                          to={`/product/${item.productId}`}
                          className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-muted"
                        >
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </Link>
                        <div className="flex-1">
                          <Link
                            to={`/product/${item.productId}`}
                            className="font-medium hover:text-primary"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                          </p>
                          <p className="mt-1 font-medium">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping address */}
                  <div className="mt-4 rounded-lg bg-muted/50 p-4">
                    <p className="text-sm font-medium">Shipping Address</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                      {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" className="group">
                      View Details
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
