import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-cream">
      {/* Main footer */}
      <div className="container py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block">
              <h2 className="font-display text-2xl font-semibold">VARNAM SILKS</h2>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Curating timeless fashion pieces that celebrate femininity and individual style since 2020.
            </p>
            <div className="mt-4 text-xs text-muted-foreground space-y-1">
              <p>📧 varnamsilkstailoring@gmail.com</p>
              <p>📞 +91 97905 46705 / +91 81484 94747</p>
              <p>🏢 GSTIN: 33AHHPA5326M1ZH</p>
            </div>
            <div className="mt-6 flex gap-4">
              <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="mailto:varnamsilkstailoring@gmail.com" className="text-muted-foreground transition-colors hover:text-foreground">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">Shop</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/shop?category=men" className="text-sm text-muted-foreground hover:text-foreground">
                  Men
                </Link>
              </li>
              <li>
                <Link to="/shop?category=women" className="text-sm text-muted-foreground hover:text-foreground">
                  Women
                </Link>
              </li>
              <li>
                <Link to="/shop?category=kids" className="text-sm text-muted-foreground hover:text-foreground">
                  Kids
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">Customer Service</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping-info" className="text-sm text-muted-foreground hover:text-foreground">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns-exchanges" className="text-sm text-muted-foreground hover:text-foreground">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-sm text-muted-foreground hover:text-foreground">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">Company</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/about-us" className="text-sm text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-sm text-muted-foreground hover:text-foreground">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} VARNAM SILKS. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground mr-2">We accept:</span>
            {/* Visa */}
            <svg className="h-6 w-auto opacity-60" viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.5 1.5l-3.8 13h-3l-3.8-13h3.2l2.4 9.5 2.4-9.5h2.6zm4.8 0l-2.5 13h-2.8l2.5-13h2.8zm11.2 8.5c0-2.5-3.5-2.6-3.5-3.7 0-.3.3-.6 1-.7.4-.1 1.4-.1 2.5.4l.4-2c-.6-.2-1.4-.4-2.4-.4-2.5 0-4.3 1.3-4.3 3.2 0 1.4 1.3 2.1 2.2 2.6 1 .5 1.3.8 1.3 1.2 0 .7-.8 1-1.6 1-1.3 0-2.1-.3-2.7-.6l-.5 2.1c.6.3 1.7.5 2.9.5 2.7 0 4.7-1.3 4.7-3.3zm7-8.5l-2.1 13h-2.5l-2.1-13h2.7l1.2 7.9 1.2-7.9h1.6z" fill="currentColor"/>
            </svg>
            {/* Mastercard */}
            <svg className="h-8 w-auto opacity-60" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="16" r="12" fill="#EB001B" opacity="0.8"/>
              <circle cx="30" cy="16" r="12" fill="#F79E1B" opacity="0.8"/>
            </svg>
            {/* UPI */}
            <span className="text-sm font-medium opacity-60 border border-current rounded px-2 py-0.5">UPI</span>
            {/* Razorpay */}
            <span className="text-sm font-medium text-blue-600 opacity-60">Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
