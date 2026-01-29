import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FilterState } from '@/types';
import { categories, sizes, colors } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  maxPrice: number;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  maxPrice,
}) => {
  const handleCategoryChange = (category: string) => {
    onFilterChange({ ...filters, category });
  };

  const handlePriceChange = (value: number[]) => {
    onFilterChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const handleSizeToggle = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onFilterChange({ ...filters, sizes: newSizes });
  };

  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    onFilterChange({ ...filters, colors: newColors });
  };

  const clearFilters = () => {
    onFilterChange({
      category: '',
      priceRange: [0, maxPrice],
      sizes: [],
      colors: [],
      sortBy: 'newest',
    });
  };

  const hasActiveFilters =
    filters.category ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice;

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider">
          Category
        </h4>
        <div className="space-y-2">
          <button
            onClick={() => handleCategoryChange('')}
            className={cn(
              'block w-full text-left text-sm transition-colors',
              filters.category === '' ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            All Products
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.slug)}
              className={cn(
                'block w-full text-left text-sm transition-colors',
                filters.category === category.slug
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider">
          Price Range
        </h4>
        <Slider
          value={[filters.priceRange[0], filters.priceRange[1]]}
          onValueChange={handlePriceChange}
          max={maxPrice}
          step={500}
          className="mb-4"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>₹{filters.priceRange[0].toLocaleString()}</span>
          <span>₹{filters.priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider">
          Size
        </h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeToggle(size)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-md border text-sm transition-all',
                filters.sizes.includes(size)
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border hover:border-foreground'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider">
          Color
        </h4>
        <div className="space-y-3">
          {colors.map((color) => (
            <label
              key={color}
              className="flex cursor-pointer items-center gap-3"
            >
              <Checkbox
                checked={filters.colors.includes(color)}
                onCheckedChange={() => handleColorToggle(color)}
              />
              <span
                className="h-5 w-5 rounded-full border border-border"
                style={{
                  backgroundColor:
                    color.toLowerCase() === 'white'
                      ? '#ffffff'
                      : color.toLowerCase() === 'black'
                      ? '#1a1a1a'
                      : color.toLowerCase() === 'beige'
                      ? '#f5f5dc'
                      : color.toLowerCase() === 'navy'
                      ? '#000080'
                      : color.toLowerCase(),
                }}
              />
              <span className="text-sm">{color}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop filters */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-28">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-semibold">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            )}
          </div>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile filter sheet */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {filters.sizes.length + filters.colors.length + (filters.category ? 1 : 0)}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display">Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ProductFilters;
