import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const FAQ: React.FC = () => {
  return (
    <Layout>
      <div className="container py-12 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <HelpCircle className="h-12 w-12 text-rose-600" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about orders, shipping, returns, and more.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold mb-4">Orders & Payment</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I place an order?</AccordionTrigger>
                  <AccordionContent>
                    Browse our collection, add items to your cart, and proceed to checkout. You'll need to 
                    provide shipping information and payment details. You can checkout as a guest or create 
                    an account for faster future purchases.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                  <AccordionContent>
                    We accept Credit/Debit Cards (Visa, Mastercard, Amex), UPI, Net Banking, Wallets 
                    (Paytm, PhonePe, Google Pay), and Cash on Delivery (COD) for eligible orders.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Is it safe to use my credit card on your site?</AccordionTrigger>
                  <AccordionContent>
                    Yes, absolutely. We use industry-standard SSL encryption to protect your payment 
                    information. All transactions are processed through secure payment gateways. We never 
                    store your complete card details on our servers.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Can I modify or cancel my order?</AccordionTrigger>
                  <AccordionContent>
                    You can cancel or modify your order within 2 hours of placing it. Contact our customer 
                    support immediately. Once the order is shipped, modifications are not possible, but you 
                    can return items as per our return policy.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>Do you offer Cash on Delivery?</AccordionTrigger>
                  <AccordionContent>
                    Yes, COD is available for orders up to ₹10,000 in select locations. A nominal COD 
                    fee may apply. The option will be shown at checkout if available for your address.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold mb-4">Shipping & Delivery</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="ship-1">
                  <AccordionTrigger>How long does delivery take?</AccordionTrigger>
                  <AccordionContent>
                    Delivery typically takes 3-7 business days depending on your location. Metro cities 
                    receive orders faster (3-5 days) while remote areas may take up to 10 days. You'll 
                    receive tracking information once your order ships.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ship-2">
                  <AccordionTrigger>What are the shipping charges?</AccordionTrigger>
                  <AccordionContent>
                    Shipping is FREE for orders above ₹999. For orders below ₹999, a flat shipping 
                    fee of ₹99 applies.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ship-3">
                  <AccordionTrigger>Do you ship internationally?</AccordionTrigger>
                  <AccordionContent>
                    Currently, we only ship within India. We're working on expanding to international 
                    shipping soon. Sign up for our newsletter to be notified when we launch international 
                    delivery.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ship-4">
                  <AccordionTrigger>How can I track my order?</AccordionTrigger>
                  <AccordionContent>
                    You'll receive a tracking number via email and SMS once your order ships. You can 
                    also track your order in the "My Orders" section of your account or use the tracking 
                    link provided in the shipping confirmation.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold mb-4">Returns & Exchanges</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="return-1">
                  <AccordionTrigger>What is your return policy?</AccordionTrigger>
                  <AccordionContent>
                    We accept returns within 7 days of delivery. Items must be unused, unworn, with 
                    original tags attached, and in original packaging. Contact our support team to 
                    initiate a return. Refunds are processed within 7-10 business days after we receive 
                    the item.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="return-2">
                  <AccordionTrigger>Can I exchange an item?</AccordionTrigger>
                  <AccordionContent>
                    Yes, exchanges for size or color are available within 7 days of delivery, subject 
                    to availability. Follow the same return process, and we'll ship the replacement 
                    once we receive the original item.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="return-3">
                  <AccordionTrigger>Who pays for return shipping?</AccordionTrigger>
                  <AccordionContent>
                    We offer free reverse pickup in select locations. For other areas, customers are 
                    responsible for return shipping costs unless the item is defective or we sent the 
                    wrong product.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="return-4">
                  <AccordionTrigger>Are there items that cannot be returned?</AccordionTrigger>
                  <AccordionContent>
                    Yes, innerwear, lingerie, sale/clearance items (unless defective), altered items, 
                    and gift cards cannot be returned for hygiene and policy reasons.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold mb-4">Products & Sizing</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="prod-1">
                  <AccordionTrigger>How do I choose the right size?</AccordionTrigger>
                  <AccordionContent>
                    Refer to our detailed size guide available on each product page and in the footer. 
                    Measure yourself according to the instructions provided. If you're between sizes, 
                    we recommend sizing up. You can also contact our customer support for personalized 
                    sizing advice.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="prod-2">
                  <AccordionTrigger>Are the colors accurate in photos?</AccordionTrigger>
                  <AccordionContent>
                    We strive to display colors as accurately as possible. However, colors may vary 
                    slightly due to screen settings and lighting conditions. If you're unsure about a 
                    color, contact us for more details or check customer reviews for real-life photos.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="prod-3">
                  <AccordionTrigger>How do I care for my clothing?</AccordionTrigger>
                  <AccordionContent>
                    Care instructions are provided on the product label. Generally, we recommend dry 
                    cleaning for silk and delicate fabrics, and gentle machine wash for cotton items. 
                    Always check the care label before washing.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="prod-4">
                  <AccordionTrigger>Will items be restocked?</AccordionTrigger>
                  <AccordionContent>
                    Popular items are regularly restocked. Click "Notify Me" on out-of-stock products 
                    to receive an email when they're back in stock. You can also contact support to 
                    inquire about specific items.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold mb-4">Account & Privacy</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="acc-1">
                  <AccordionTrigger>Do I need an account to shop?</AccordionTrigger>
                  <AccordionContent>
                    No, you can checkout as a guest. However, creating an account allows you to track 
                    orders, save addresses, view order history, and enjoy a faster checkout experience.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="acc-2">
                  <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                  <AccordionContent>
                    Click "Forgot Password" on the login page, enter your email address, and you'll 
                    receive a password reset link. Follow the instructions in the email to create a 
                    new password.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="acc-3">
                  <AccordionTrigger>Is my personal information secure?</AccordionTrigger>
                  <AccordionContent>
                    Yes, we take data security seriously. We use SSL encryption for all transactions 
                    and comply with industry-standard security practices. Read our Privacy Policy for 
                    details on how we protect and use your information.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="bg-rose-50 border-rose-200">
            <CardContent className="p-6">
              <h2 className="font-display text-xl font-semibold mb-2">Still have questions?</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Our customer support team is here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href="mailto:varnamsilkstailoring@gmail.com" 
                  className="text-sm text-rose-600 hover:underline"
                >
                  varnamsilkstailoring@gmail.com
                </a>
                <span className="hidden sm:inline text-muted-foreground">|</span>
                <a 
                  href="tel:+919790546705" 
                  className="text-sm text-rose-600 hover:underline"
                >
                  +91 97905 46705
                </a>
                <span className="hidden sm:inline text-muted-foreground">|</span>
                <a 
                  href="tel:+918148494747" 
                  className="text-sm text-rose-600 hover:underline"
                >
                  +91 81484 94747
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;
