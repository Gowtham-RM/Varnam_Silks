import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, XCircle, CheckCircle, AlertCircle } from 'lucide-react';

const ReturnsExchanges: React.FC = () => {
  return (
    <Layout>
      <div className="container py-12 max-w-4xl">
        <h1 className="font-display text-4xl font-bold mb-4">Returns & Exchanges</h1>
        <p className="text-lg text-muted-foreground mb-8">
          We want you to be completely satisfied with your purchase. Learn about our hassle-free return and exchange policy.
        </p>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 mb-4">
                <RefreshCw className="h-8 w-8 text-rose-600" />
                <div>
                  <h2 className="font-display text-2xl font-semibold mb-2">Return Policy</h2>
                  <p className="text-muted-foreground mb-4">
                    We accept returns within <strong>7 days</strong> of delivery. Items must be:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Unused, unworn, and in original condition</li>
                    <li>With all original tags and packaging intact</li>
                    <li>Accompanied by the original invoice</li>
                    <li>Free from any damage, stains, or alterations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold mb-4">How to Return an Item</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Request a Return</h3>
                    <p className="text-sm text-muted-foreground">
                      Contact our customer support via email or phone within 7 days of delivery.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Get Approval</h3>
                    <p className="text-sm text-muted-foreground">
                      Our team will review your request and provide return instructions if approved.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Ship the Item</h3>
                    <p className="text-sm text-muted-foreground">
                      Pack the item securely and ship it using the provided return label or address.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-semibold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Get Your Refund</h3>
                    <p className="text-sm text-muted-foreground">
                      Once we receive and inspect the item, refund will be processed within 7-10 business days.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold mb-4">Exchange Policy</h2>
              <p className="text-muted-foreground mb-4">
                We offer exchanges for size or color within <strong>7 days</strong> of delivery, subject to availability. 
                The exchange process is similar to returns:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Contact customer support to request an exchange</li>
                <li>Return the original item following our return process</li>
                <li>Once received and inspected, we'll ship the replacement item</li>
                <li>If the desired item is unavailable, we'll process a refund</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold mb-4">Non-Returnable Items</h2>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="flex gap-3 items-start">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Innerwear & Lingerie</p>
                    <p className="text-xs text-muted-foreground">For hygiene reasons</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Sale/ Clearance Items</p>
                    <p className="text-xs text-muted-foreground">Unless defective</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Altered Items</p>
                    <p className="text-xs text-muted-foreground">Custom alterations</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Gift Cards</p>
                    <p className="text-xs text-muted-foreground">Non-refundable</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold mb-4">Refund Method</h2>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Refunds will be credited to the original payment method
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-sm">
                      For Cash on Delivery orders, refunds will be processed via bank transfer
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Please allow 7-10 business days for refunds to reflect in your account
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold mb-4">Return Shipping</h2>
              <p className="text-muted-foreground mb-4">
                <strong>Free reverse pickup</strong> is available for eligible returns in select locations. 
                For other areas, customers are responsible for return shipping costs unless the item is 
                defective or incorrect.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-rose-50 border-rose-200">
            <CardContent className="p-6">
              <h2 className="font-display text-xl font-semibold mb-2">Questions?</h2>
              <p className="text-sm text-muted-foreground">
                Contact our customer support team at{' '}
                <a href="mailto:varnamsilkstailoring@gmail.com" className="text-rose-600 hover:underline">
                  varnamsilkstailoring@gmail.com
                </a>
                {' '}or call{' '}
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

export default ReturnsExchanges;
