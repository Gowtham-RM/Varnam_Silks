import React, { useState } from 'react';
import { Search, Eye, ChevronDown } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { mockOrders } from '@/data/mockData';
import { Order } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusOptions = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

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

const AdminOrders: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = (orderId: string, newStatus: Order['orderStatus']) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, orderStatus: newStatus, updatedAt: new Date().toISOString() }
          : order
      )
    );
    toast.success(`Order status updated to ${newStatus}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">Orders</h1>
          <p className="mt-1 text-muted-foreground">
            Manage and track all orders
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Orders table */}
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{order.shippingAddress.city}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.shippingAddress.state}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{order.orderItems.length} items</TableCell>
                  <TableCell className="font-medium">
                    ₹{order.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn('capitalize', paymentColors[order.paymentStatus])}
                    >
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Badge
                            variant="secondary"
                            className={cn('capitalize', statusColors[order.orderStatus])}
                          >
                            {order.orderStatus}
                          </Badge>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {statusOptions.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusChange(order.id, status)}
                            className="capitalize"
                          >
                            {status}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          )}
        </div>
      </div>

      {/* Order details dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              Order {selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order status */}
              <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Status</p>
                  <Badge
                    className={cn(
                      'mt-1 capitalize',
                      statusColors[selectedOrder.orderStatus]
                    )}
                  >
                    {selectedOrder.orderStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Badge
                    className={cn(
                      'mt-1 capitalize',
                      paymentColors[selectedOrder.paymentStatus]
                    )}
                  >
                    {selectedOrder.paymentStatus}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="mt-1 text-lg font-semibold">
                    ₹{selectedOrder.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Order items */}
              <div>
                <h4 className="font-medium mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-16 w-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping address */}
              <div>
                <h4 className="font-medium mb-2">Shipping Address</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.shippingAddress.street}
                  <br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                  <br />
                  {selectedOrder.shippingAddress.zipCode}, {selectedOrder.shippingAddress.country}
                </p>
              </div>

              {/* Timestamps */}
              <div className="flex gap-8 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Updated:</span>{' '}
                  {new Date(selectedOrder.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;
