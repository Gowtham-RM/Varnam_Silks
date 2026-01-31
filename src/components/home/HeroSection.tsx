import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] bg-gradient-hero overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-48 -top-48 h-96 w-96 rounded-full bg-rose/20 blur-3xl" />
        <div className="absolute -left-48 bottom-0 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
      </div>

      <div className="container relative flex min-h-[90vh] items-center py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Text content */}
          <div className="max-w-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              New Collection 2026
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
              Discover Your
              <span className="block text-primary">Signature Style</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Explore our curated collection for Men, Women and Kids.
              Find your perfect look for every occasion.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/shop">
                <Button variant="hero" size="xl">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/shop?category=women">
                <Button variant="heroOutline" size="xl">
                  Shop Women
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 flex gap-12">
              <div>
                <p className="font-display text-3xl font-semibold">500+</p>
                <p className="text-sm text-muted-foreground">Unique Styles</p>
              </div>
              <div>
                <p className="font-display text-3xl font-semibold">50K+</p>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
              <div>
                <p className="font-display text-3xl font-semibold">4.9</p>
                <p className="text-sm text-muted-foreground">Customer Rating</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div
            className="relative animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-elegant">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800"
                alt="Fashion model in elegant dress"
                className="h-full w-full object-cover"
              />
              {/* Floating card */}
              <div className="absolute bottom-6 left-6 right-6 rounded-xl bg-background/95 p-4 backdrop-blur shadow-elegant">
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=100"
                    alt="Featured product"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Featured</p>
                    <p className="font-display font-medium">Silk Evening Gown</p>
                    <p className="text-sm font-semibold text-primary">₹12,999</p>
                  </div>
                  <Link to="/product/1">
                    <Button size="sm" variant="default">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full border-4 border-gold/30" />
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full border-4 border-rose/30" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
