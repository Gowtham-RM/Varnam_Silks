import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/home.png';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[65vh] bg-gradient-hero overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-48 -top-48 h-96 w-96 rounded-full bg-rose/20 blur-3xl" />
        <div className="absolute -left-48 bottom-0 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
      </div>

      <div className="container relative flex min-h-[65vh] items-center py-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center w-full">
          {/* Text content */}
          <div className="max-w-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              New Collection 2026
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
              Discover Your
              <span className="block text-primary">Signature Style</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Explore our wide range of premium ethnic wear.
              From Kanjivaram Sarees to Classic Menswear and Kids' favorites.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/shop?category=women">
                <Button variant="hero" size="lg">
                  Shop Women
                </Button>
              </Link>
              <Link to="/shop?category=men">
                <Button variant="hero" size="lg">
                  Shop Men
                </Button>
              </Link>
              <Link to="/shop?category=kids">
                <Button variant="hero" size="lg">
                  Shop Kids
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-8 flex gap-8">
              <div>
                <p className="font-display text-2xl font-semibold">500+</p>
                <p className="text-xs text-muted-foreground">Unique Styles</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold">50K+</p>
                <p className="text-xs text-muted-foreground">Happy Customers</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold">4.9</p>
                <p className="text-xs text-muted-foreground">Customer Rating</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div
            className="relative animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl shadow-elegant">
              <img
                src={heroImage}
                alt="Couple in Traditional Ethnic Wear"
                className="h-full w-full object-cover"
              />
              {/* Floating card */}
              <div className="absolute bottom-6 left-6 right-6 rounded-xl bg-background/95 p-4 backdrop-blur shadow-elegant">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-4">
                    <div className="h-12 w-12 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100" className="h-full w-full object-cover" />
                    </div>
                    <div className="h-12 w-12 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1622290291314-1f256e353287?w=100" className="h-full w-full object-cover" />
                    </div>
                    <div className="h-12 w-12 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium">
                      +500
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">New Arrivals</p>
                    <p className="font-display font-medium">Summer Collection</p>
                  </div>
                  <Link to="/shop">
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
