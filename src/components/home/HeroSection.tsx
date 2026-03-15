import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/home.png';
import api from '@/lib/api';

const HeroSection: React.FC = () => {
  const [productImages, setProductImages] = React.useState<string[]>([
    "https://placehold.co/100x100/f8f9fa/a1a1aa?text=+",
    "https://placehold.co/100x100/f8f9fa/a1a1aa?text=+"
  ]);

  React.useEffect(() => {
    const fetchRecentImages = async () => {
        try {
            const resp = await api.get('/products');
            if (resp.data && resp.data.length >= 2) {
                // Get the first two products' images
                const validImages = resp.data
                    .filter((p: any) => p.images && p.images.length > 0)
                    .map((p: any) => p.images[0])
                    .slice(0, 2);
                
                if (validImages.length === 2) {
                    setProductImages(validImages);
                }
            }
        } catch (e) {
            console.error("Error fetching images for hero", e);
        }
    };
    fetchRecentImages();
    const intervalId = setInterval(fetchRecentImages, 2000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="relative bg-gradient-hero overflow-hidden min-h-[500px] md:min-h-[600px] lg:min-h-[calc(100vh-5rem)]">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-48 -top-48 h-96 w-96 rounded-full bg-rose/20 blur-3xl" />
        <div className="absolute -left-48 bottom-0 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
      </div>

      <div className="container relative flex items-center py-8 md:py-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center w-full">
          {/* Text content */}
          <div className="max-w-xl animate-slide-up z-10" style={{ animationDelay: '0.1s' }}>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              New Collection 2026
            </p>
            <h1 className="font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Discover Your
              <span className="block text-primary">Signature Style</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">
              Explore our wide range of premium ethnic wear.
              From Kanjivaram Sarees to Classic Menswear and Kids' favorites.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
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
            className="relative animate-slide-up h-full flex items-center justify-center mt-8 lg:mt-0"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="relative w-full overflow-hidden rounded-2xl shadow-elegant bg-black max-h-[400px] md:max-h-[500px] lg:max-h-[calc(100vh-12rem)]">
              <img
                src={heroImage}
                alt="Couple in Traditional Ethnic Wear"
                className="h-full w-full object-contain object-center rounded-2xl"
              />
              {/* Floating card */}
              <div className="absolute bottom-6 left-6 right-6 rounded-xl bg-background/95 p-4 backdrop-blur shadow-elegant">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-4">
                    <div className="h-12 w-12 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                      <img src={productImages[0]} className="h-full w-full object-cover" onError={(e) => e.currentTarget.src = "https://placehold.co/100x100/f8f9fa/a1a1aa?text=+"} />
                    </div>
                    <div className="h-12 w-12 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                      <img src={productImages[1]} className="h-full w-full object-cover" onError={(e) => e.currentTarget.src = "https://placehold.co/100x100/f8f9fa/a1a1aa?text=+"} />
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
