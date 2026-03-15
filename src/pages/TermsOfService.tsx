import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';

const TermsOfService: React.FC = () => {
  return (
    <Layout>
      <div className="container py-12 max-w-4xl">
        <h1 className="font-display text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 12, 2026</p>

        <Card>
          <CardContent className="p-8 prose prose-sm max-w-none">
            <section className="mb-8">
              <h2 className="font-display text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using VARNAM SILKS website and services, you agree to be bound by these 
                Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-2xl font-semibold mb-4">2. Use of Services</h2>
              <p className="text-muted-foreground mb-4">You agree to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide accurate and complete information when creating an account</li>
                <li>Maintain the security of your account credentials</li>
                <li>Not use our services for any illegal or unauthorized purpose</li>
                <li>Not violate any laws in your jurisdiction</li>
                <li>Not interfere with or disrupt our services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-2xl font-semibold mb-4">3. Orders and Payments</h2>
              <p className="text-muted-foreground mb-4">
                When you place an order, you are making an offer to purchase products. We reserve the right 
                to accept or decline your order for any reason. All prices are in Indian Rupees (INR) and 
                are subject to change without notice.
              </p>
              <p className="text-muted-foreground">
                Payment must be received before we process your order. We accept various payment methods 
                as displayed at checkout.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-2xl font-semibold mb-4">4. Shipping and Delivery</h2>
              <p className="text-muted-foreground">
                We aim to dispatch orders within 2-3 business days. Delivery times vary depending on your 
                location. We are not responsible for delays caused by shipping carriers or circumstances 
                beyond our control.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-2xl font-semibold mb-4">5. Returns and Refunds</h2>
              <p className="text-muted-foreground">
                We accept returns within 7 days of delivery for unused items in original condition with 
                tags attached. Refunds will be processed within 7-10 business days after we receive and 
                inspect the returned item. Please refer to our Returns & Exchanges page for detailed information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-2xl font-semibold mb-4">6. Product Information</h2>
              <p className="text-muted-foreground">
                We strive to display product information accurately. However, we do not warrant that product 
                descriptions, colors, or other content are error-free. Colors may vary slightly due to 
                screen settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-2xl font-semibold mb-4">7. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content on this website, including text, images, logos, and designs, is the property 
                of VARNAM SILKS and protected by copyright and trademark laws. You may not use our content 
                without explicit permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                VARNAM SILKS shall not be liable for any indirect, incidental, special, or consequential 
                damages arising from your use of our services or products.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-2xl font-semibold mb-4">9. Modifications</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective 
                immediately upon posting. Your continued use of our services constitutes acceptance of the 
                modified terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">10. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, contact us at{' '}
                <a href="mailto:varnamsilkstailoring@gmail.com" className="text-rose-600 hover:underline">
                  varnamsilkstailoring@gmail.com
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TermsOfService;
