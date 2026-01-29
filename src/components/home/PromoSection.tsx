import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PromoSection: React.FC = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Promo 1 */}
          <div className="group relative overflow-hidden rounded-2xl bg-charcoal">
            <img
              src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800"
              alt="Summer collection"
              className="h-80 w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105 md:h-96"
            />
            <div className="absolute inset-0 flex flex-col items-start justify-center p-8 md:p-12">
              <p className="text-sm font-medium uppercase tracking-wider text-primary-foreground/80">
                Limited Time
              </p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-primary-foreground md:text-4xl">
                Summer Sale
              </h3>
              <p className="mt-2 text-lg text-primary-foreground/90">
                Up to 50% off on selected items
              </p>
              <Link to="/shop" className="mt-6">
                <Button variant="hero" className="bg-primary-foreground text-charcoal hover:bg-primary-foreground/90">
                  Shop the Sale
                </Button>
              </Link>
            </div>
          </div>

          {/* Promo 2 */}
          <div className="group relative overflow-hidden rounded-2xl bg-rose-light">
            <img
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=800"
              alt="New arrivals"
              className="h-80 w-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-105 md:h-96"
            />
            <div className="absolute inset-0 flex flex-col items-start justify-center p-8 md:p-12">
              <p className="text-sm font-medium uppercase tracking-wider text-foreground/80">
                Just Landed
              </p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-foreground md:text-4xl">
                New Arrivals
              </h3>
              <p className="mt-2 text-lg text-foreground/80">
                Discover the latest trends
              </p>
              <Link to="/shop?sortBy=newest" className="mt-6">
                <Button variant="hero">
                  Explore Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
