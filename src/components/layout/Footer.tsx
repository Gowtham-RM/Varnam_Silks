import React from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Footer: React.FC = () => {
  const supportEmail = 'varnamsilkstailoring@gmail.com';
  const emailSubject = encodeURIComponent('Enquiry from Varnam Silks Website');
  const emailBody = encodeURIComponent('Hi Varnam Silks Team,\n\nI would like to know more about your products/services.\n\nName:\nPhone:\nRequirement:\n\nThanks.');
  const emailHref = `mailto:${supportEmail}?subject=${emailSubject}&body=${emailBody}`;

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
              <p>
                📧{' '}
                <a href={emailHref} className="hover:text-foreground transition-colors">
                  {supportEmail}
                </a>
              </p>
              <p>📞 +91 97905 46705 / +91 81484 94747</p>
              <p>🏢 GSTIN: 33AHHPA5326M1ZH</p>
            </div>
            <div className="mt-6 flex gap-4">
              <a
                href="https://www.instagram.com/varnam._silks?igsh=MjNiNjJyZ2xzbHB1"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2zm8.5 1.8h-8.5A3.96 3.96 0 0 0 3.8 7.75v8.5a3.96 3.96 0 0 0 3.95 3.95h8.5a3.96 3.96 0 0 0 3.95-3.95v-8.5a3.96 3.96 0 0 0-3.95-3.95zm-4.25 3.7a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 1.8a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4zm4.95-2.05a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1z" />
                </svg>
              </a>
              <a
                href="https://chat.whatsapp.com/I9ubluHoXiODVNmMD7Hz32"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.52 3.48A11.9 11.9 0 0 0 12.04 0C5.42 0 .05 5.37.05 12c0 2.1.55 4.14 1.6 5.94L0 24l6.23-1.63A11.93 11.93 0 0 0 12.03 24h.01c6.62 0 11.99-5.37 11.99-12 0-3.2-1.25-6.22-3.51-8.52zM12.04 21.95h-.01a9.9 9.9 0 0 1-5.03-1.38l-.36-.21-3.7.97.99-3.6-.24-.37A9.9 9.9 0 0 1 2.1 12c0-5.48 4.46-9.95 9.95-9.95 2.66 0 5.16 1.04 7.05 2.92A9.88 9.88 0 0 1 22 12c0 5.49-4.47 9.95-9.96 9.95zm5.46-7.44c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47a8.94 8.94 0 0 1-1.66-2.06c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.57-.48-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.47 0 1.45 1.07 2.85 1.22 3.05.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@varnam_silks"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.5 6.2a3.01 3.01 0 0 0-2.12-2.13C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.57A3.01 3.01 0 0 0 .5 6.2C0 8.08 0 12 0 12s0 3.92.5 5.8a3.01 3.01 0 0 0 2.12 2.13C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.57a3.01 3.01 0 0 0 2.12-2.13c.5-1.88.5-5.8.5-5.8s0-3.92-.5-5.8zM9.6 15.6V8.4L16 12l-6.4 3.6z" />
                </svg>
              </a>
              <a
                href={emailHref}
                aria-label="Email"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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
                <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground">
                  Data Sharing Policy
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
