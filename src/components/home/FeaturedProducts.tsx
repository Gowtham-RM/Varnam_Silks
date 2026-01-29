import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import api from '@/lib/api';

const FeaturedProducts: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');
        const featured = data.filter((p: Product) => p.featured).slice(0, 4);
        setFeaturedProducts(featured);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="py-20 bg-cream">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-4 mb-12 md:flex-row">
          <div>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              Featured Collection
            </h2>
            <p className="mt-3 text-muted-foreground">
              Our most loved pieces, handpicked for you
            </p>
          </div>
          <Link to="/shop">
            <Button variant="outline" className="group">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="flex justify-center py-12">
            <p className="text-muted-foreground">No featured products available</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
