import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid3X3, LayoutGrid } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterState, Product } from '@/types';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 50000;
    return Math.max(...products.map((p) => p.price));
  }, [products]);

  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || '',
    priceRange: [0, 50000],
    sizes: [],
    colors: [],
    sortBy: (searchParams.get('sortBy') as FilterState['sortBy']) || 'newest',
  });

  // Update price range when products load
  useEffect(() => {
    if (products.length > 0 && filters.priceRange[1] === 50000) {
      const max = Math.max(...products.map((p) => p.price));
      setFilters((prev) => ({ ...prev, priceRange: [0, max] }));
    }
  }, [products]);

  // Update filters when URL changes
  useEffect(() => {
    const category = searchParams.get('category') || '';
    const sortBy = (searchParams.get('sortBy') as FilterState['sortBy']) || 'newest';
    setFilters((prev) => ({ ...prev, category, sortBy }));
  }, [searchParams]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    const search = searchParams.get('search')?.toLowerCase();
    if (search) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (filters.category) {
      result = result.filter((p) => p.category === filters.category);
    }

    // Price filter
    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Size filter
    if (filters.sizes.length > 0) {
      result = result.filter((p) =>
        p.sizes && p.sizes.length > 0 && filters.sizes.some((size) => p.sizes.includes(size))
      );
    }

    // Color filter
    if (filters.colors.length > 0) {
      result = result.filter((p) =>
        p.colors && p.colors.length > 0 && filters.colors.some((color) => p.colors.includes(color))
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        break;
      case 'newest':
      default:
        result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return result;
  }, [filters, searchParams]);

  const handleSortChange = (value: string) => {
    setFilters((prev) => ({ ...prev, sortBy: value as FilterState['sortBy'] }));
    setSearchParams((prev) => {
      prev.set('sortBy', value);
      return prev;
    });
  };

  return (
    <Layout>
      {/* Header */}
      <div className="bg-cream py-12">
        <div className="container">
          <h1 className="font-display text-3xl font-semibold md:text-4xl">
            {filters.category
              ? filters.category.charAt(0).toUpperCase() + filters.category.slice(1)
              : 'All Products'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {filteredProducts.length} products
            {searchParams.get('search') && ` for "${searchParams.get('search')}"`}
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-8">
          {/* Filters sidebar */}
          <ProductFilters
            filters={filters}
            onFilterChange={setFilters}
            maxPrice={maxPrice}
          />

          {/* Products grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4 lg:hidden">
                <ProductFilters
                  filters={filters}
                  onFilterChange={setFilters}
                  maxPrice={maxPrice}
                />
              </div>

              <div className="ml-auto flex items-center gap-4">
                {/* Grid toggle */}
                <div className="hidden items-center gap-1 md:flex">
                  <Button
                    variant={gridCols === 3 ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setGridCols(3)}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={gridCols === 4 ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setGridCols(4)}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sort */}
                <Select value={filters.sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length > 0 ? (
              <div
                className={cn(
                  'grid gap-6',
                  gridCols === 3
                    ? 'sm:grid-cols-2 lg:grid-cols-3'
                    : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                )}
              >
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-lg font-medium text-foreground">No products found</p>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Shop;
