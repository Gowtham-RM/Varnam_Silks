import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Truck, MapPin, Clock } from 'lucide-react';

const ShippingInfo: React.FC = () => {
  return (
    <Layout>
      <div className="container py-12 max-w-4xl">
        <h1 className="font-display text-4xl font-bold mb-4">Shipping Information</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Learn about our shipping policies, delivery times, and costs.
        </p>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 mb-4">
                <Package className="h-8 w-8 text-rose-600" />
                <div>
                  <h2 className="font-display text-2xl font-semibold mb-2">Processing Time</h2>
                  <p className="text-muted-foreground">
                    Orders are typically processed within <strong>2-3 business days</strong> after payment 
                    confirmation. You will receive a confirmation email once your order has been dispatched 
                    with tracking information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 mb-4">
                <Truck className="h-8 w-8 text-rose-600" />
                <div>
                  <h2 className="font-display text-2xl font-semibold mb-2">Delivery Times</h2>
                  <div className="space-y-4 mt-4">
                    <div className="border-l-4 border-rose-600 pl-4">
                      <h3 className="font-semibold mb-1">Metro Cities</h3>
                      <p className="text-sm text-muted-foreground">3-5 business days</p>
                    </div>
                    <div className="border-l-4 border-rose-400 pl-4">
                      <h3 className="font-semibold mb-1">Other Cities</h3>
                      <p className="text-sm text-muted-foreground">5-7 business days</p>
                    </div>
                    <div className="border-l-4 border-rose-300 pl-4">
                      <h3 className="font-semibold mb-1">Remote Areas</h3>
                      <p className="text-sm text-muted-foreground">7-10 business days</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    * Delivery times are estimates and may vary during peak seasons or due to unforeseen circumstances.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 mb-4">
                <MapPin className="h-8 w-8 text-rose-600" />
                <div>
                  <h2 className="font-display text-2xl font-semibold mb-2">Shipping Charges</h2>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between items-center p-3 bg-rose-50 rounded-lg">
                      <span className="font-medium">Orders above ₹999</span>
                      <span className="text-green-600 font-semibold">FREE</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Orders below ₹999</span>
                      <span className="font-semibold">₹99</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 mb-4">
                <Clock className="h-8 w-8 text-rose-600" />
                <div>
                  <h2 className="font-display text-2xl font-semibold mb-2">Order Tracking</h2>
                  <p className="text-muted-foreground mb-4">
                    Once your order is shipped, you will receive a tracking number via email and SMS. 
                    You can track your order:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Using the tracking link in your shipping confirmation email</li>
                    <li>In the "My Orders" section of your account</li>
                    <li>Directly on our courier partner's website</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold mb-4">Shipping Partners</h2>
              <p className="text-muted-foreground mb-4">
                We work with trusted courier partners to ensure safe and timely delivery:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="font-semibold">Blue Dart</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="font-semibold">Delhivery</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="font-semibold">FedEx</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="font-semibold">India Post</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-rose-50 border-rose-200">
            <CardContent className="p-6">
              <h2 className="font-display text-xl font-semibold mb-2">Need Help?</h2>
              <p className="text-sm text-muted-foreground">
                For shipping-related queries, contact our customer support at{' '}
                <a href="mailto:varnamsilkstailoring@gmail.com" className="text-rose-600 hover:underline">
                  varnamsilkstailoring@gmail.com
                </a>
                {' '}or call us at{' '}
                <a href="tel:+919790546705" className="text-rose-600 hover:underline">
                  +91 97905 46705
                </a>
                {' '}or{' '}
                <a href="tel:+918148494747" className="text-rose-600 hover:underline">
                  +91 81484 94747
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ShippingInfo;
