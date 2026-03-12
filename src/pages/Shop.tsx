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
    let ignore = false;
    
    const fetchProducts = async (isPolling = false) => {
      if (!isPolling) setLoading(true);
      try {
        // Construct query parameters for the smart search API
        const params = new URLSearchParams();
        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const subCategory = searchParams.get('sub');

        if (search) params.append('q', search);
        if (category) params.append('category', category);
        if (subCategory) params.append('subCategory', subCategory);

        // If there's any search or major filter, hit the smart endpoint. Otherwise, get all.
        const endpoint = (search || category || subCategory)
          ? `/products/search?${params.toString()}`
          : '/products';

        console.log('Fetching:', endpoint);
        const { data } = await api.get(endpoint);

        if (!ignore) {
          // The search API returns { products: [...] }, while the base API returns an array [...]
          setProducts(data.products || data);
        }
      } catch (error) {
        if (!ignore) console.error('Failed to fetch products', error);
      } finally {
        if (!ignore && !isPolling) setLoading(false);
      }
    };

    // Slight debounce for fetch to let filters settle
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 100);

    const intervalId = setInterval(() => {
      fetchProducts(true);
    }, 2000);

    return () => {
      ignore = true;
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [searchParams]);

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 50000;
    return Math.max(...products.map((p) => p.price));
  }, [products]);

  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || '',
    subCategory: searchParams.get('sub') || '',
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
    const subCategory = searchParams.get('sub') || '';
    
    setFilters((prev) => {
      const categoryChanged = prev.category !== category || prev.subCategory !== subCategory;
      return {
        ...prev,
        category,
        subCategory,
        sortBy,
        attributes: categoryChanged ? {} : prev.attributes
      };
    });
  }, [searchParams]);

  // Filter and sort products (for price, size, color, attributes which are still maintained in local state)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Note: Search, Category, and SubCategory are now handled by the Backend API.

    // Price filter
    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Size filter
    if (filters.sizes.length > 0) {
      result = result.filter((p) =>
        p.sizes && p.sizes.length > 0 && filters.sizes.some((size) => p.sizes.some(s => s.size === size))
      );
    }

    // Color filter
    if (filters.colors.length > 0) {
      result = result.filter((p) =>
        p.colors && p.colors.length > 0 && filters.colors.some((color) => p.colors.includes(color))
      );
    }

    // Attribute filters
    if (filters.attributes) {
      if (filters.attributes.fit && filters.attributes.fit.length > 0) {
        result = result.filter((p) => p.fit && filters.attributes!.fit!.includes(p.fit));
      }
      if (filters.attributes.pattern && filters.attributes.pattern.length > 0) {
        result = result.filter((p) => p.pattern && filters.attributes!.pattern!.includes(p.pattern));
      }
      if (filters.attributes.borderType && filters.attributes.borderType.length > 0) {
        result = result.filter((p) => p.borderType && filters.attributes!.borderType!.includes(p.borderType));
      }
      if (filters.attributes.occasion && filters.attributes.occasion.length > 0) {
        result = result.filter((p) => p.occasion && filters.attributes!.occasion!.includes(p.occasion));
      }
      if (filters.attributes.fabric && filters.attributes.fabric.length > 0) {
        result = result.filter((p) => p.fabric && filters.attributes!.fabric!.includes(p.fabric));
      }
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
  }, [filters, searchParams, products]);

  const handleSortChange = (value: string) => {
    setFilters((prev) => ({ ...prev, sortBy: value as FilterState['sortBy'] }));
    setSearchParams((prev) => {
      prev.set('sortBy', value);
      return prev;
    });
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setSearchParams((prev) => {
      if (newFilters.category) {
        prev.set('category', newFilters.category);
      } else {
        prev.delete('category');
      }
      if (newFilters.subCategory) {
        prev.set('sub', newFilters.subCategory);
      } else {
        prev.delete('sub');
      }
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
          {/* Filters sidebar - Hidden on mobile to prevent duplicate trigger */}
          <div className="hidden lg:block">
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              maxPrice={maxPrice}
              products={products}
            />
          </div>

          {/* Products grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 lg:hidden">
                <ProductFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  maxPrice={maxPrice}
                  products={products}
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
                  'grid gap-3 sm:gap-6',
                  gridCols === 3
                    ? 'grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
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
                <p className="text-lg font-medium text-foreground">No products found. Try another search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Shop;
