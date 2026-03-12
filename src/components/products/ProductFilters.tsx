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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FilterState, Product } from '@/types';
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
  products?: Product[];
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  maxPrice,
  products,
}) => {
  const [searchParams] = useSearchParams();
  const subCategory = searchParams.get('sub') || '';
  const attributesConfig = getProductAttributes(filters.category, subCategory);

  const getCustomAttributes = React.useCallback(
    (type: keyof NonNullable<FilterState['attributes']>, baseOptions: string[]) => {
      if (!products) return [];
      const allVals = new Set<string>();
      products.forEach((p) => {
        const val = p[type];
        if (val && typeof val === 'string') allVals.add(val);
      });
      return Array.from(allVals).filter((v) => !baseOptions.includes(v));
    },
    [products]
  );

  const customColors = React.useMemo(() => {
    if (!products) return [];
    const allColors = new Set<string>();
    products.forEach((p) => p.colors?.forEach((c) => allColors.add(c)));
    return Array.from(allColors).filter((c) => !colors.includes(c));
  }, [products]);

  const displayColors = [...colors, ...customColors];
  const displayFabricOptions = [...attributesConfig.fabric.options, ...getCustomAttributes('fabric', attributesConfig.fabric.options)];
  const displayFitOptions = [...attributesConfig.fit.options, ...getCustomAttributes('fit', attributesConfig.fit.options)];
  const displayPatternOptions = [...attributesConfig.pattern.options, ...getCustomAttributes('pattern', attributesConfig.pattern.options)];
  const displayBorderTypeOptions = [...attributesConfig.borderType.options, ...getCustomAttributes('borderType', attributesConfig.borderType.options)];
  const displayOccasionOptions = [...attributesConfig.occasion.options, ...getCustomAttributes('occasion', attributesConfig.occasion.options)];

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

  const filterContentJSX = (
    <div className="space-y-6">
      <Accordion type="multiple" className="w-full">
        {/* Categories */}
        <AccordionItem value="category">
          <AccordionTrigger className="font-display text-sm font-semibold uppercase tracking-wider hover:no-underline">
            Category
          </AccordionTrigger>
          <AccordionContent>
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => handleCategoryChange(value === 'all' ? '' : value)}
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                <SelectItem value="all">All Products</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        {/* Sub Categories (Dynamic) */}
        {filters.category && subCategories.length > 0 && (
          <AccordionItem value="subCategory">
            <AccordionTrigger className="font-display text-sm font-semibold uppercase tracking-wider hover:no-underline">
              Sub Category
            </AccordionTrigger>
            <AccordionContent>
              <Select
                value={filters.subCategory || 'all'}
                onValueChange={(value) => handleSubCategoryChange(value === 'all' ? '' : value)}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder={`All ${filters.category}`} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <SelectItem value="all">All {filters.category}</SelectItem>
                  {subCategories.map((sub) => (
                    <SelectItem key={sub.value} value={sub.value}>
                      {sub.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger className="font-display text-sm font-semibold uppercase tracking-wider hover:no-underline">
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4">
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
          </AccordionContent>
        </AccordionItem>

        {/* Sizes */}
        <AccordionItem value="size">
          <AccordionTrigger className="font-display text-sm font-semibold uppercase tracking-wider hover:no-underline">
            Size
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div>
                <p className="mb-3 text-xs font-medium text-muted-foreground">{currentSizeStandard.label}</p>
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
          </AccordionContent>
        </AccordionItem>

        {/* Dynamic Attributes */}
        {attributesConfig.fabric.show && (
          <AccordionItem value="fabric">
            <AccordionTrigger className="font-display text-sm font-semibold uppercase tracking-wider hover:no-underline">
              Fabric
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {displayFabricOptions.map((option) => (
                  <label key={option} className="flex cursor-pointer items-center gap-3">
                    <Checkbox
                      checked={filters.attributes?.fabric?.includes(option) ?? false}
                      onCheckedChange={() => handleAttributeToggle('fabric', option)}
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {attributesConfig.fit.show && (
          <AccordionItem value="fit">
            <AccordionTrigger className="font-display text-sm font-semibold uppercase tracking-wider hover:no-underline">
              Fit
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {displayFitOptions.map((option) => (
                  <label key={option} className="flex cursor-pointer items-center gap-3">
                    <Checkbox
                      checked={filters.attributes?.fit?.includes(option) ?? false}
                      onCheckedChange={() => handleAttributeToggle('fit', option)}
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {attributesConfig.pattern.show && (
          <AccordionItem value="pattern">
            <AccordionTrigger className="font-display text-sm font-semibold uppercase tracking-wider hover:no-underline">
              Pattern
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {displayPatternOptions.map((option) => (
                  <label key={option} className="flex cursor-pointer items-center gap-3">
                    <Checkbox
                      checked={filters.attributes?.pattern?.includes(option) ?? false}
                      onCheckedChange={() => handleAttributeToggle('pattern', option)}
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {attributesConfig.borderType.show && (
          <AccordionItem value="borderType">
            <AccordionTrigger className="font-display text-sm font-semibold uppercase tracking-wider hover:no-underline">
              Border Type
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {displayBorderTypeOptions.map((option) => (
                  <label key={option} className="flex cursor-pointer items-center gap-3">
                    <Checkbox
                      checked={filters.attributes?.borderType?.includes(option) ?? false}
                      onCheckedChange={() => handleAttributeToggle('borderType', option)}
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {attributesConfig.occasion.show && (
          <AccordionItem value="occasion">
            <AccordionTrigger className="font-display text-sm font-semibold uppercase tracking-wider hover:no-underline">
              Occasion
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {displayOccasionOptions.map((option) => (
                  <label key={option} className="flex cursor-pointer items-center gap-3">
                    <Checkbox
                      checked={filters.attributes?.occasion?.includes(option) ?? false}
                      onCheckedChange={() => handleAttributeToggle('occasion', option)}
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Colors */}
        <AccordionItem value="color" className="border-b-0">
          <AccordionTrigger className="font-display text-sm font-semibold uppercase tracking-wider hover:no-underline">
            Color
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {displayColors.map((color) => (
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full mt-4">
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
          {filterContentJSX}
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
            {filterContentJSX}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ProductFilters;
