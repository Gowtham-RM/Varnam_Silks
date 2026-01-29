import React, { useState, useEffect } from 'react';
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
import { products, categories, sizes, colors } from '@/data/mockData';
import { toast } from 'sonner';

const AdminProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    stock: '',
    sizes: [] as string[],
    colors: [] as string[],
    images: [] as string[],
    featured: false,
  });

  useEffect(() => {
    if (isEditing) {
      const product = products.find((p) => p.id === id);
      if (product) {
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          originalPrice: product.originalPrice?.toString() || '',
          category: product.category,
          stock: product.stock.toString(),
          sizes: product.sizes,
          colors: product.colors,
          images: product.images,
          featured: product.featured || false,
        });
      }
    }
  }, [id, isEditing]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeToggle = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleColorToggle = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const handleImageAdd = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully');
    navigate('/admin/products');
  };

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
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Pricing & Inventory</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
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
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="mt-1.5"
                  required
                />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Variants</h2>
            <div className="mt-6 space-y-6">
              <div>
                <Label>Sizes</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`rounded-lg border px-4 py-2 text-sm transition-all ${
                        formData.sizes.includes(size)
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border hover:border-foreground'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Colors</Label>
                <div className="mt-2 space-y-2">
                  {colors.map((color) => (
                    <label
                      key={color}
                      className="flex cursor-pointer items-center gap-3"
                    >
                      <Checkbox
                        checked={formData.colors.includes(color)}
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
            </div>
          </div>

          {/* Images */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Images</h2>
            <div className="mt-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="group relative aspect-[3/4]">
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
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
              </div>
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, featured: checked as boolean }))
              }
            />
            <Label htmlFor="featured">Feature this product on homepage</Label>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" variant="hero" disabled={isLoading}>
              {isLoading ? (
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
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminProductForm;
