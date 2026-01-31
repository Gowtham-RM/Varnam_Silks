import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Minus, Plus, ShoppingBag, Star, Truck, RefreshCw, Shield } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Product } from '@/types';
import api from '@/lib/api';
import { useWishlist } from '@/context/WishlistContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [alsoBought, setAlsoBought] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        setLoading(true);
        // 1. Fetch current product
        const { data: currentProduct } = await api.get(`/products/${id}`);
        setProduct(currentProduct);

        // 2. Fetch ML-powered recommendations
        const { data: related } = await api.get(`/products/${id}/recommendations`);
        setRelatedProducts(related);

        // 3. Fetch Collaborative Filtering results
        const { data: bought } = await api.get(`/products/${id}/also-bought`);
        if (Array.isArray(bought)) {
          setAlsoBought(bought);
        } else {
          console.warn('Also bought data is not an array:', bought);
          setAlsoBought([]);
        }
      } catch (error) {
        console.error('Failed to fetch product data', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductAndRelated();
      window.scrollTo(0, 0);
    }
  }, [id]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  const isWishlisted = product ? isInWishlist(product.id) : false;

  if (loading) {
    return <Layout><div className="container py-20 text-center">Loading...</div></Layout>;
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-2xl font-semibold">Product not found</h1>
          <Link to="/shop" className="mt-4 inline-block text-primary hover:underline">
            Back to Shop
          </Link>
        </div>
      </Layout>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }
    addToCart(product, quantity, selectedSize, selectedColor);
    window.location.href = '/checkout';
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-cream">
        <div className="container py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-foreground">Shop</Link>
            <span>/</span>
            <Link to={`/shop?category=${product.category}`} className="hover:text-foreground capitalize">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 shadow-elegant transition-transform hover:scale-110"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 shadow-elegant transition-transform hover:scale-110"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              {discount > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'aspect-[3/4] w-20 overflow-hidden rounded-lg border-2 transition-all',
                      selectedImage === index ? 'border-foreground' : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={image} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="lg:py-4">
            <p className="text-sm uppercase tracking-wider text-muted-foreground">
              {product.category}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating && (
              <div className="mt-4 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < Math.floor(product.rating!) ? 'fill-gold text-gold' : 'text-muted'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-3">
              <p className="text-3xl font-semibold text-foreground">
                ₹{product.price.toLocaleString()}
              </p>
              {product.originalPrice && (
                <p className="text-xl text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </p>
              )}
              {discount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-1 text-sm font-medium text-primary">
                  Save {discount}%
                </span>
              )}
            </div>

            <p className="mt-6 text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Color selection */}
            <div className="mt-8">
              <p className="mb-3 text-sm font-medium">
                Color: <span className="font-normal text-muted-foreground">{selectedColor || 'Select a color'}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'flex h-10 items-center gap-2 rounded-lg border px-4 text-sm transition-all',
                      selectedColor === color
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:border-foreground'
                    )}
                  >
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
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size selection */}
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">
                  Size: <span className="font-normal text-muted-foreground">{selectedSize || 'Select a size'}</span>
                </p>
                <button className="text-sm text-primary hover:underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'flex h-12 min-w-12 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-all',
                      selectedSize === size
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:border-foreground'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-border">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-12 w-12 items-center justify-center transition-colors hover:bg-muted"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="flex h-12 w-12 items-center justify-center transition-colors hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {product.stock} items available
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4">
              <Button
                onClick={handleAddToCart}
                variant="hero"
                size="xl"
                className="flex-1"
                disabled={product.stock === 0}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                onClick={() => product && toggleWishlist(product)}
                variant="outline"
                size="xl"
              >
                <Heart className={cn('h-5 w-5', isWishlisted && 'fill-primary text-primary')} />
              </Button>
            </div>

            <Button
              onClick={handleBuyNow}
              variant="outline"
              size="lg"
              className="mt-4 w-full"
              disabled={product.stock === 0}
            >
              Buy Now
            </Button>

            {/* Features */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-8">
              <div className="text-center">
                <Truck className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-2 text-xs text-muted-foreground">Free Shipping</p>
              </div>
              <div className="text-center">
                <RefreshCw className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-2 text-xs text-muted-foreground">Easy Returns</p>
              </div>
              <div className="text-center">
                <Shield className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-2 text-xs text-muted-foreground">Secure Payment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl font-semibold">You May Also Like</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}


        {/* Also Bought Section */}
        {alsoBought.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl font-semibold">Users Also Bought</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {alsoBought.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
