import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FilterState } from '@/types';
import { categories, colors } from '@/data/mockData';
import { SIZE_STANDARDS } from '@/data/sizeStandards';

import { getProductAttributes } from '@/data/attributes';
import { NAV_ITEMS } from '@/data/navigation';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';

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
  const [searchParams] = useSearchParams();
  const subCategory = searchParams.get('sub') || '';
  const attributesConfig = getProductAttributes(filters.category, subCategory);

  const handleAttributeToggle = (type: keyof NonNullable<FilterState['attributes']>, value: string) => {
    const currentAttributes = filters.attributes || {};
    const currentValues = currentAttributes[type] || [];

    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onFilterChange({
      ...filters,
      attributes: {
        ...currentAttributes,
        [type]: newValues,
      },
    });
  };
  const handleCategoryChange = (category: string) => {
    onFilterChange({ ...filters, category, subCategory: '' });
  };

  const handleSubCategoryChange = (subCategory: string) => {
    onFilterChange({ ...filters, subCategory });
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
      subCategory: '',
      priceRange: [0, maxPrice],
      sizes: [],
      colors: [],
      attributes: {},
      sortBy: 'newest',
    });
  };

  // Helper to get subcategories for the selected category
  const getSubCategories = () => {
    if (!filters.category) return [];

    // Find the category in NAV_ITEMS (case-insensitive)
    const categoryItem = NAV_ITEMS.find(
      item => item.label.toLowerCase() === filters.category.toLowerCase()
    );

    if (!categoryItem || !categoryItem.columns) return [];

    // Flatten all columns to get all subcategory items
    return categoryItem.columns.flatMap(col => col.items).map(item => {
      // Extract 'sub' param from href
      const url = new URL(item.href, 'http://dummy.com');
      return {
        label: item.label,
        value: url.searchParams.get('sub') || ''
      };
    }).filter(item => item.value);
  };

  const subCategories = getSubCategories();

  // Helper to determine size standard based on category
  const getSizeStandard = () => {
    const cat = filters.category.toLowerCase();
    const sub = filters.subCategory?.toLowerCase() || '';

    if (cat === 'men') {
      if (sub.includes('innerwear')) {
        return SIZE_STANDARDS.MenInnerwear;
      }
      if (sub.includes('trousers') || sub.includes('jeans') || sub.includes('track-pants')) {
        return SIZE_STANDARDS.Numeric;
      }
      return SIZE_STANDARDS.Alpha;
    }

    if (cat === 'women') {
      if (sub.includes('saree') || sub === 'sarees' || sub.includes('dupattas')) {
        return SIZE_STANDARDS.Saree;
      }
      if (sub.includes('bras') || sub.includes('panties') || sub.includes('sleepwear')) {
        return SIZE_STANDARDS.Innerwear;
      }
      if (sub.includes('jeans') || sub.includes('leggings') || sub.includes('palazzos') || sub.includes('skirts')) {
        return SIZE_STANDARDS.Numeric; // Assuming bottomwear uses numeric, or could be Alpha based on specific standard
      }
      return SIZE_STANDARDS.Alpha;
    }

    if (cat === 'kids') {
      if (sub.includes('innerwear')) {
        return SIZE_STANDARDS.Innerwear;
      }
      return SIZE_STANDARDS.Kids;
    }

    // Default to showing Alpha if no specific category or all
    return SIZE_STANDARDS.Alpha;
  };

  const currentSizeStandard = getSizeStandard();

  const hasActiveFilters =
    filters.category ||
    filters.subCategory ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    (filters.attributes && Object.values(filters.attributes).some(arr => arr && arr.length > 0)) ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice;

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider">
          Category
        </h4>
        <Select
          value={filters.category}
          onValueChange={(value) => handleCategoryChange(value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sub Categories (Dynamic) */}
      {filters.category && subCategories.length > 0 && (
        <div>
          <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider">
            Sub Category
          </h4>
          <Select
            value={filters.subCategory || 'all'}
            onValueChange={(value) => handleSubCategoryChange(value === 'all' ? '' : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`All ${filters.category}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filters.category}</SelectItem>
              {subCategories.map((sub) => (
                <SelectItem key={sub.value} value={sub.value}>
                  {sub.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">{currentSizeStandard.label}</p>
            <div className="flex flex-wrap gap-2">
              {currentSizeStandard.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeToggle(size)}
                  className={cn(
                    'flex h-10 min-w-[2.5rem] items-center justify-center rounded-md border px-2 text-sm transition-all',
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
        </div>
      </div>



      {/* Dynamic Attributes */}
      {attributesConfig.fabric.show && (
        <div>
          <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider">Fabric</h4>
          <div className="space-y-3">
            {attributesConfig.fabric.options.map((option) => (
              <label key={option} className="flex cursor-pointer items-center gap-3">
                <Checkbox
                  checked={filters.attributes?.fabric?.includes(option) ?? false}
                  onCheckedChange={() => handleAttributeToggle('fabric', option)}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {attributesConfig.fit.show && (
        <div>
          <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider">Fit</h4>
          <div className="space-y-3">
            {attributesConfig.fit.options.map((option) => (
              <label key={option} className="flex cursor-pointer items-center gap-3">
                <Checkbox
                  checked={filters.attributes?.fit?.includes(option) ?? false}
                  onCheckedChange={() => handleAttributeToggle('fit', option)}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {attributesConfig.pattern.show && (
        <div>
          <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider">Pattern</h4>
          <div className="space-y-3">
            {attributesConfig.pattern.options.map((option) => (
              <label key={option} className="flex cursor-pointer items-center gap-3">
                <Checkbox
                  checked={filters.attributes?.pattern?.includes(option) ?? false}
                  onCheckedChange={() => handleAttributeToggle('pattern', option)}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {attributesConfig.borderType.show && (
        <div>
          <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider">Border Type</h4>
          <div className="space-y-3">
            {attributesConfig.borderType.options.map((option) => (
              <label key={option} className="flex cursor-pointer items-center gap-3">
                <Checkbox
                  checked={filters.attributes?.borderType?.includes(option) ?? false}
                  onCheckedChange={() => handleAttributeToggle('borderType', option)}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {attributesConfig.occasion.show && (
        <div>
          <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider">Occasion</h4>
          <div className="space-y-3">
            {attributesConfig.occasion.options.map((option) => (
              <label key={option} className="flex cursor-pointer items-center gap-3">
                <Checkbox
                  checked={filters.attributes?.occasion?.includes(option) ?? false}
                  onCheckedChange={() => handleAttributeToggle('occasion', option)}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Colors (Moved to bottom) */}
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
