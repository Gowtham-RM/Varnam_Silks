import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { products, categories, colors } from '@/data/mockData';
import { SIZE_STANDARDS, SizeType, getSizeOptions } from '@/data/sizeStandards';
import { NAV_ITEMS } from '@/data/navigation';
import { getProductAttributes } from '@/data/attributes';
import api from '@/lib/api';
import { toast } from 'sonner';
import { uploadToCloudinary } from '@/lib/upload';

const AdminProductForm: React.FC = () => {
  // Helper to find case-insensitive match in options
  const findMatch = (value: string, options: string[]) => {
    if (!value) return '';
    const trimmedValue = value.trim().toLowerCase();
    return options.find(opt => opt.toLowerCase() === trimmedValue) || value;
  };

  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    subCategory: '',
    sizeType: 'Alpha' as SizeType,
    stock: '',
    sizes: [] as { size: string; colors: { color: string; stock: number; inStock: boolean }[] }[],
    colors: [] as string[],
    images: [] as string[],
    featured: false,
    fit: '',
    pattern: '',
    borderType: '',

    occasion: '',
    fabric: '',
  });

  const attributes = getProductAttributes(formData.category, formData.subCategory);

  const [colorImageMap, setColorImageMap] = useState<Record<string, string>>({}); // Map image URL to Color

  useEffect(() => {
    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/products/${id}`);

          // Reconstruct colorImageMap from backend data if available, otherwise try to infer or leave empty
          const initialColorMap: Record<string, string> = {};
          if (data.colorImages && Array.isArray(data.colorImages)) {
            data.colorImages.forEach((ci: { color: string, image: string }) => {
              initialColorMap[ci.image] = ci.color;
            });
          }



          const rawCategory = data.category || '';
          const categorySlug = rawCategory.trim().toLowerCase();

          // Find subcategory match
          const categoryItem = NAV_ITEMS.find(item => item.label.toLowerCase() === categorySlug);

          const subCategoryOptions = categoryItem?.columns?.flatMap(col => col.items.map(i => i.label)) || [];
          const matchedSubCategory = findMatch(data.subCategory, subCategoryOptions);

          // Get attribute options based on category/subcategory
          const attrOptions = getProductAttributes(categorySlug, matchedSubCategory);

          setFormData({
            name: data.name,
            description: data.description,
            price: data.price.toString(),
            originalPrice: data.originalPrice?.toString() || '',
            category: categorySlug, // Use the slug for the Select value
            subCategory: matchedSubCategory || '',
            sizeType: (data.sizeType as SizeType) || 'Alpha',
            stock: data.stock.toString(),
            sizes: Array.isArray(data.sizes)
              ? data.sizes.map((s: any) =>
                typeof s === 'string'
                  ? { size: s, colors: [] } // Handle legacy string sizes
                  : {
                    size: s.size,
                    colors: Array.isArray(s.colors) ? s.colors : []
                  }
              )
              : [],
            colors: data.colors || [],
            images: data.images || [],
            featured: data.featured || false,
            fit: findMatch(data.fit, attrOptions.fit.options),
            pattern: findMatch(data.pattern, attrOptions.pattern.options),
            borderType: findMatch(data.borderType, attrOptions.borderType.options),
            occasion: findMatch(data.occasion, attrOptions.occasion.options),
            fabric: findMatch(data.fabric, attrOptions.fabric.options),
          });
          setColorImageMap(initialColorMap);
        } catch (error) {
          console.error('Failed to fetch product:', error);
          toast.error('Failed to load product details');
          navigate('/admin/products');
        }
      };

      fetchProduct();
    }
  }, [id, isEditing, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeToggle = (size: string) => {
    setFormData((prev) => {
      const exists = prev.sizes.find((s) => s.size === size);
      let newSizes;
      if (exists) {
        newSizes = prev.sizes.filter((s) => s.size !== size);
      } else {
        // Initialize new size with all current colors having 0 stock
        const initialColors = prev.colors.map(c => ({ color: c, stock: 0, inStock: true }));
        newSizes = [...prev.sizes, { size, colors: initialColors }];
      }
      return { ...prev, sizes: newSizes };
    });
  };

  const handleSizeColorStockChange = (size: string, color: string, stock: string) => {
    const stockVal = parseInt(stock) || 0;
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s) => {
        if (s.size === size) {
          // Update or add color entry
          const colorExists = s.colors.find(c => c.color === color);
          let newColors;
          if (colorExists) {
            newColors = s.colors.map(c => c.color === color ? { ...c, stock: stockVal, inStock: stockVal > 0 } : c);
          } else {
            newColors = [...s.colors, { color, stock: stockVal, inStock: stockVal > 0 }];
          }
          return { ...s, colors: newColors };
        }
        return s;
      }),
    }));
  };

  const handleColorToggle = (color: string) => {
    setFormData((prev) => {
      const isSelected = prev.colors.includes(color);
      const newColors = isSelected
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color];

      // Sync sizes with new colors
      const newSizes = prev.sizes.map(s => {
        if (isSelected) {
          // Remove color from size
          return { ...s, colors: s.colors.filter(c => c.color !== color) };
        } else {
          // Add color to size
          return { ...s, colors: [...s.colors, { color, stock: 0, inStock: true }] };
        }
      });

      return {
        ...prev,
        colors: newColors,
        sizes: newSizes
      };
    });
  };

  const handleImageAdd = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageRemove = (index: number) => {
    const imageUrl = formData.images[index];
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    // Remove from map
    const newMap = { ...colorImageMap };
    delete newMap[imageUrl];
    setColorImageMap(newMap);
  };

  const handleImageColorChange = (imageUrl: string, color: string) => {
    setColorImageMap(prev => ({
      ...prev,
      [imageUrl]: color
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation: Check if every selected color has at least one image
      const missingColorImages = formData.colors.filter(color => {
        // Check if any image is mapped to this color
        const hasImage = Object.values(colorImageMap).includes(color);
        return !hasImage;
      });

      if (missingColorImages.length > 0) {
        toast.error(`Please assign an image for: ${missingColorImages.join(', ')}`);
        setIsLoading(false);
        return;
      }

      // Validate Fabric if shown
      if (attributes.fabric.show && !formData.fabric) {
        toast.error('Please select a fabric');
        setIsLoading(false);
        return;
      }

      // Calculate total stock from all sizes and colors
      const totalStock = formData.sizes.reduce((acc, size) => {
        return acc + size.colors.reduce((sAcc, color) => sAcc + (color.stock || 0), 0);
      }, 0);

      // Prepare colorImages array for backend
      const colorImagesArray = Object.entries(colorImageMap).map(([image, color]) => ({
        color,
        image
      }));

      const productData = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stock: totalStock,
        image: formData.images[0] || '',
        colorImages: colorImagesArray
      };

      if (isEditing) {
        await api.put(`/products/${id}`, productData);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', productData);
        toast.success('Product created successfully');
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error(isEditing ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };


  const subCategoryOptions = NAV_ITEMS.find((item) => item.label.toLowerCase() === formData.category.toLowerCase())
    ?.columns?.flatMap((col) => col.items.map(i => i.label)) || [];

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/products')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
          <h1 className="font-display text-3xl font-semibold">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic info */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Basic Information</h2>
            <div className="mt-6 space-y-5">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1.5 min-h-32"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subCategory">Sub Category</Label>
                <Select
                  value={findMatch(formData.subCategory, subCategoryOptions)}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, subCategory: value }))
                  }
                  disabled={!formData.category}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select sub category" />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategoryOptions.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>



          {/* Attributes (Conditional) */}
          {
            (attributes.fit.show || attributes.pattern.show || attributes.borderType.show || attributes.occasion.show || attributes.fabric.show) && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-semibold">Product Attributes</h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {attributes.fabric.show && (
                    <div>
                      <Label htmlFor="fabric">Fabric</Label>
                      <Select
                        value={formData.fabric}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, fabric: value }))}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select fabric" />
                        </SelectTrigger>
                        <SelectContent>
                          {attributes.fabric.options.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {attributes.fit.show && (
                    <div>
                      <Label htmlFor="fit">Fit</Label>
                      <Select
                        value={formData.fit}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, fit: value }))}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select fit" />
                        </SelectTrigger>
                        <SelectContent>
                          {attributes.fit.options.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {attributes.pattern.show && (
                    <div>
                      <Label htmlFor="pattern">Pattern</Label>
                      <Select
                        value={formData.pattern}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, pattern: value }))}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select pattern" />
                        </SelectTrigger>
                        <SelectContent>
                          {attributes.pattern.options.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {attributes.borderType.show && (
                    <div>
                      <Label htmlFor="borderType">Border Type</Label>
                      <Select
                        value={formData.borderType}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, borderType: value }))}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select border type" />
                        </SelectTrigger>
                        <SelectContent>
                          {attributes.borderType.options.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {attributes.occasion.show && (
                    <div>
                      <Label htmlFor="occasion">Occasion</Label>
                      <Select
                        value={formData.occasion}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, occasion: value }))}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select occasion" />
                        </SelectTrigger>
                        <SelectContent>
                          {attributes.occasion.options.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            )
          }

          {/* Pricing */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Pricing & Inventory</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="originalPrice">Original Price (₹)</Label>
                <Input
                  id="originalPrice"
                  name="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  className="mt-1.5"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Variants</h2>
            <div className="mt-6 space-y-6">
              <div>
                <Label htmlFor="sizeType">Size Standard</Label>
                <Select
                  value={formData.sizeType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, sizeType: value as SizeType, sizes: [] }))
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select size standard" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(SIZE_STANDARDS).map((key) => (
                      <SelectItem key={key} value={key}>
                        {SIZE_STANDARDS[key as SizeType].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Sizes</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {getSizeOptions(formData.sizeType).map((size) => {
                    const isSelected = formData.sizes.some((s) => s.size === size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeToggle(size)}
                        className={`rounded-lg border px-4 py-2 text-sm transition-all ${isSelected
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border hover:border-foreground'
                          }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label>Colors</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <label
                      key={color}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-1.5 transition-colors hover:bg-muted"
                    >
                      <Checkbox
                        checked={formData.colors.includes(color)}
                        onCheckedChange={() => handleColorToggle(color)}
                      />
                      <span
                        className="h-4 w-4 rounded-full border border-border"
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

              <div>
                <Label>Stock Management (Size x Color)</Label>
                <div className="mt-4 space-y-6">
                  {formData.sizes.map((sizeObj) => (
                    <div key={sizeObj.size} className="rounded-lg border border-border p-4">
                      <h4 className="font-medium mb-3">Size: {sizeObj.size}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {formData.colors.map((color) => {
                          const colorStock = sizeObj.colors.find(c => c.color === color)?.stock || 0;
                          return (
                            <div key={`${sizeObj.size}-${color}`} className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">{color}</Label>
                              <Input
                                type="number"
                                min="0"
                                value={colorStock}
                                onChange={(e) => handleSizeColorStockChange(sizeObj.size, color, e.target.value)}
                                className="h-8"
                              />
                            </div>
                          );
                        })}
                        {formData.colors.length === 0 && (
                          <div className="text-sm text-muted-foreground col-span-full">
                            Please select colors first to manage stock.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {formData.sizes.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      Please select sizes first to manage stock.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Images</h2>
            <div className="mt-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="group relative aspect-[3/4] flex flex-col">
                    <div className="relative flex-1 overflow-hidden rounded-lg">
                      <img
                        src={image}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageRemove(index)}
                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2">
                      <Select
                        value={colorImageMap[image] || ''}
                        onValueChange={(val) => handleImageColorChange(image, val)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select Color" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.colors.map(c => (
                            <SelectItem key={c} value={c} className="text-xs">
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleImageAdd}
                  className="flex aspect-[3/4] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-foreground hover:bg-muted"
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="mt-2 text-sm text-muted-foreground">Add Image</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>
            </div>
          </div>




          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" variant="hero" disabled={isLoading || isUploading}>
              {isLoading || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Update Product'
              ) : (
                'Create Product'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
            >
              Cancel
            </Button>
          </div>
        </form >
      </div >
    </AdminLayout >
  );
};

export default AdminProductForm;
