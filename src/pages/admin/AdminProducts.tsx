import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, MoreHorizontal, X } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from 'sonner';

const AdminProducts: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [productList, setProductList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProductList(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = productList.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/products/${id}`);
      setProductList((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    }
  };

  // ... existing code ...
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
  };

  const handleDeleteFromModal = async (id: string) => {
    await handleDelete(id);
    setSelectedProduct(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="sticky top-[64px] z-20 -mx-4 -mt-4 bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold">Products</h1>
              <p className="mt-1 text-muted-foreground">
                Manage your product inventory
              </p>
            </div>
            <Link to="/admin/products/new">
              <Button variant="hero" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative mt-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products table */}
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleProductClick(product)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/100'}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium line-clamp-1">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.sizes ? product.sizes.length : 0} sizes • {product.colors ? product.colors.length : 0} colors
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{product.category}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">₹{product.price.toLocaleString()}</p>
                        {product.originalPrice && (
                          <p className="text-sm text-muted-foreground line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          product.stock === 0
                            ? 'bg-red-100 text-red-700'
                            : product.stock < 3
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                        }
                      >
                        {product.stock === 0
                          ? 'Out of Stock'
                          : product.stock < 3
                            ? 'Low Stock'
                            : 'In Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/products/${product.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(product.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-background p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-display font-semibold">Product Details</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedProduct(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="aspect-[3/4] overflow-hidden rounded-lg">
                <img
                  src={selectedProduct.images?.[0] || 'https://placehold.co/400'}
                  alt={selectedProduct.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium">{selectedProduct.name}</h3>
                  <p className="text-muted-foreground capitalize">{selectedProduct.category} • {selectedProduct.subCategory}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold">₹{selectedProduct.price.toLocaleString()}</span>
                  {selectedProduct.originalPrice && (
                    <span className="text-muted-foreground line-through">₹{selectedProduct.originalPrice.toLocaleString()}</span>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground line-clamp-4">{selectedProduct.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Stock Breakdown</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {selectedProduct.sizes?.map((size: any) => (
                      <div key={size.size} className="rounded-md border p-3 text-sm">
                        <div className="font-semibold mb-2 flex justify-between">
                          <span>Size: {size.size}</span>
                        </div>
                        <div className="space-y-1">
                          {size.colors && size.colors.length > 0 ? (
                            size.colors.map((c: any) => (
                              <div key={c.color} className="flex justify-between text-xs">
                                <span className="capitalize">{c.color}</span>
                                <span className={cn(c.stock === 0 ? "text-red-500 font-medium" : "text-muted-foreground")}>
                                  {c.stock} units
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-muted-foreground">No stock data</div>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!selectedProduct.sizes || selectedProduct.sizes.length === 0) && (
                      <div className="col-span-full text-sm text-muted-foreground">No size variants</div>
                    )}
                  </div>
                  <div className="mt-2 text-sm font-medium border-t pt-2">
                    Total Stock: {selectedProduct.stock}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Colors ({selectedProduct.colors?.length || 0})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors?.map((color: string) => (
                      <Badge key={color} variant="outline" className="capitalize">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 mt-4 border-t">
                  <Link to={`/admin/products/${selectedProduct.id}/edit`} className="flex-1">
                    <Button className="w-full gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Product
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => handleDeleteFromModal(selectedProduct.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Product
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
