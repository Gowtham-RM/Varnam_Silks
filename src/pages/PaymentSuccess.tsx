import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const { orderId, total } = (location.state as { orderId?: string; total?: number }) || {};

  return (
    <Layout>
      <div className="container py-20">
        <div className="mx-auto max-w-md text-center">
          <div className="animate-scale-in">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <h1 className="mt-6 font-display text-3xl font-semibold">Payment Successful!</h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for your order. We'll send you an email with your order details.
          </p>

          {orderId && (
            <div className="mt-8 rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-medium">{orderId}</p>
                </div>
                {total && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Amount Paid</p>
                    <p className="font-semibold">₹{total.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 rounded-xl border border-border bg-muted/50 p-6">
            <Package className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              Your order will be shipped within 2-3 business days. You'll receive a tracking number via email once it's on its way.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/orders">
              <Button variant="hero">
                View Order Details
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" className="group">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
