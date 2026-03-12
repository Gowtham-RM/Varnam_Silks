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
import { useAuth } from '@/context/AuthContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();

  const [canRate, setCanRate] = useState(false);
  const [ratingReason, setRatingReason] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [alsoBought, setAlsoBought] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setLoading(true);
      
      try {
        // 1. Fetch current product (critical - must succeed)
        const { data: currentProduct } = await api.get(`/products/${id}`);
        setProduct(currentProduct);
      } catch (error: any) {
        console.error('Failed to fetch product:', error);
        toast.error(error.response?.data?.message || 'Failed to load product details');
        setLoading(false);
        return; // Stop here if main product fetch fails
      }

      // 2. Fetch ML-powered recommendations (non-critical)
      try {
        const { data: related } = await api.get(`/products/${id}/recommendations`);
        setRelatedProducts(related);
      } catch (e) {
        console.error('Failed to fetch recommendations:', e);
        setRelatedProducts([]);
      }

      // 3. Fetch Collaborative Filtering results (non-critical)
      try {
        const { data: bought } = await api.get(`/products/${id}/also-bought`);
        if (Array.isArray(bought)) {
          setAlsoBought(bought);
        } else {
          console.warn('Also bought data is not an array:', bought);
          setAlsoBought([]);
        }
      } catch (e) {
        console.error('Failed to fetch also-bought:', e);
        setAlsoBought([]);
      }

      // 4. Check rating eligibility (non-critical)
      if (isAuthenticated && user?.id) {
        try {
          const { data: rateData } = await api.get(`/products/${id}/can-rate`, {
            headers: { 'x-user-id': user.id }
          });
          setCanRate(rateData.canRate);
          if (!rateData.canRate) {
            setRatingReason(rateData.reason);
          }
        } catch (e) {
          console.error('Failed to fetch rate eligibility:', e);
        }
      }

      setLoading(false);
    };

    if (id) {
      fetchProductAndRelated();
      window.scrollTo(0, 0);
    }
  }, [id, isAuthenticated, user]);

  const submitRating = async (ratingValue: number) => {
    if (!isAuthenticated || !user?.id) {
      toast.error('Please login to rate');
      return;
    }
    if (!canRate) {
      toast.error(ratingReason || 'You cannot rate this product');
      return;
    }

    try {
      setIsSubmittingRating(true);
      const { data: updatedProduct } = await api.post(`/products/${product!.id}/rate`, { rating: ratingValue }, {
        headers: { 'x-user-id': user.id }
      });
      setProduct(updatedProduct);
      setCanRate(false);
      setRatingReason('Already rated by this user');
      setUserRating(ratingValue);
      toast.success('Thank you for your rating!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };

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
        <div className="container py-3 md:py-4">
          <nav className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground overflow-x-auto hide-scrollbar">
            <Link to="/" className="hover:text-foreground whitespace-nowrap">Home</Link>
            <span className="text-muted-foreground/50">/</span>
            <Link to="/shop" className="hover:text-foreground whitespace-nowrap">Shop</Link>
            <span className="text-muted-foreground/50">/</span>
            <Link to={`/shop?category=${product.category}`} className="hover:text-foreground capitalize whitespace-nowrap">
              {product.category}
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground truncate max-w-[150px] md:max-w-none">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container py-6 md:py-8 lg:py-12">
        <div className="grid gap-4 md:gap-6 lg:gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-3 md:space-y-4">
            <div className="relative overflow-hidden rounded-xl bg-muted sticky top-20" style={{ maxHeight: 'min(70vh, 600px)', aspectRatio: '3/4' }}>
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain"
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
              <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'aspect-[3/4] w-16 md:w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all snap-start',
                      selectedImage === index ? 'border-foreground ring-2 ring-foreground/20' : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={image} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="lg:py-4">
            <p className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground">
              {product.category}
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold leading-tight md:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            {/* Rating */}
            {(product.rating !== undefined && product.rating >= 0) && (
              <div className="mt-4 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < Math.round(product.rating!) ? 'fill-gold text-gold' : 'text-muted'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating > 0 ? `${product.rating} (${product.reviews} reviews)` : 'No reviews yet'}
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mt-4 md:mt-6 flex flex-wrap items-baseline gap-2 md:gap-3">
              <p className="text-2xl md:text-3xl font-semibold text-foreground">
                ₹{product.price.toLocaleString()}
              </p>
              {product.originalPrice && (
                <p className="text-lg md:text-xl text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </p>
              )}
              {discount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs md:text-sm font-medium text-primary">
                  Save {discount}%
                </span>
              )}
            </div>

            <p className="mt-4 md:mt-6 text-sm md:text-base text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Product Specifications */}
            <div className="mt-4 md:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs md:text-sm">
              {product.fabric && (
                <div>
                  <span className="font-medium text-foreground">Fabric:</span> <span className="text-muted-foreground">{product.fabric}</span>
                </div>
              )}
              {product.pattern && (
                <div>
                  <span className="font-medium text-foreground">Pattern:</span> <span className="text-muted-foreground">{product.pattern}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-foreground">Fit:</span> <span className="text-muted-foreground">{product.fit || 'Regular'}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Occasion:</span> <span className="text-muted-foreground">{product.occasion || 'Casual'}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Type:</span> <span className="text-muted-foreground">{product.subCategory}</span>
              </div>
            </div>

            {/* Color selection */}
            <div className="mt-6 md:mt-8">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm md:text-base font-medium">
                  Color: <span className="font-normal text-muted-foreground">{selectedColor || 'Select a color'}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {product.colors.map((color) => {
                  let isAvailable = true;
                  let stockForColor = 0;

                  if (selectedSize) {
                    const sizeObj = product.sizes.find(s => s.size === selectedSize);
                    const colorObj = sizeObj?.colors.find(c => c.color === color);
                    stockForColor = colorObj?.stock || 0;
                    isAvailable = stockForColor > 0;
                  } else {
                    // Check if color exists in any size with stock > 0
                    isAvailable = product.sizes.some(s => s.colors.some(c => c.color === color && c.stock > 0));
                  }

                  return (
                    <button
                      key={color}
                      onClick={() => isAvailable && setSelectedColor(color)}
                      disabled={!isAvailable}
                      className={cn(
                        'flex h-9 md:h-10 items-center gap-2 rounded-lg border px-3 md:px-4 text-xs md:text-sm transition-all',
                        selectedColor === color
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border hover:border-foreground',
                        !isAvailable && 'opacity-50 cursor-not-allowed bg-muted'
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
                      {/* Show stock if both size and color are selected or if only color logic needed */}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size selection */}
            <div className="mt-5 md:mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm md:text-base font-medium">
                  Size: <span className="font-normal text-muted-foreground">{selectedSize || 'Select a size'}</span>
                </p>
                <button className="text-xs md:text-sm text-primary hover:underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {product.sizes.map((sizeObj) => {
                  const totalStock = sizeObj.colors.reduce((acc, c) => acc + c.stock, 0);

                  // If a color is selected, check if this size has stock for that color
                  let isAvailable = totalStock > 0;
                  if (selectedColor) {
                    const colorObj = sizeObj.colors.find(c => c.color === selectedColor);
                    isAvailable = (colorObj?.stock || 0) > 0;
                  }

                  return (
                    <button
                      key={sizeObj.size}
                      onClick={() => isAvailable && setSelectedSize(sizeObj.size)}
                      disabled={!isAvailable}
                      className={cn(
                        'flex h-10 md:h-12 min-w-10 md:min-w-12 items-center justify-center rounded-lg border px-3 md:px-4 text-xs md:text-sm font-medium transition-all',
                        selectedSize === sizeObj.size
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border hover:border-foreground',
                        !isAvailable && 'opacity-50 cursor-not-allowed bg-muted'
                      )}
                    >
                      {sizeObj.size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-5 md:mt-6">
              <p className="mb-3 text-sm md:text-base font-medium">Quantity</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center rounded-lg border border-border">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center transition-colors hover:bg-muted"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 md:w-12 text-center font-medium text-sm md:text-base">{quantity}</span>
                  <button
                    onClick={() => {
                      let maxStock = product.stock;
                      if (selectedSize && selectedColor) {
                        const sizeObj = product.sizes.find(s => s.size === selectedSize);
                        const colorObj = sizeObj?.colors.find(c => c.color === selectedColor);
                        maxStock = colorObj?.stock || 0;
                      } else if (selectedSize) {
                        const sizeObj = product.sizes.find(s => s.size === selectedSize);
                        maxStock = sizeObj?.colors.reduce((acc, c) => acc + c.stock, 0) || 0;
                      }
                      setQuantity((q) => Math.min(maxStock, q + 1));
                    }}
                    className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center transition-colors hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {selectedSize && selectedColor
                    ? `${product.sizes.find(s => s.size === selectedSize)?.colors.find(c => c.color === selectedColor)?.stock || 0} items available`
                    : selectedSize
                      ? `${product.sizes.find(s => s.size === selectedSize)?.colors.reduce((acc, c) => acc + c.stock, 0) || 0} items total in this size`
                      : `${product.stock} items total`}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 md:mt-8 flex gap-3 md:gap-4">
              <Button
                onClick={handleAddToCart}
                variant="hero"
                size="lg"
                className="flex-1 h-11 md:h-12 text-sm md:text-base"
                disabled={product.stock === 0}
              >
                <ShoppingBag className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Add to Cart
              </Button>
              <Button
                onClick={() => product && toggleWishlist(product)}
                variant="outline"
                size="lg"
                className="h-11 md:h-12 w-11 md:w-12 p-0"
              >
                <Heart className={cn('h-4 w-4 md:h-5 md:w-5', isWishlisted && 'fill-primary text-primary')} />
              </Button>
            </div>

            <Button
              onClick={handleBuyNow}
              variant="outline"
              size="lg"
              className="mt-3 md:mt-4 w-full h-11 md:h-12 text-sm md:text-base"
              disabled={product.stock === 0}
            >
              Buy Now
            </Button>

            {/* Features */}
            <div className="mt-6 md:mt-8 grid grid-cols-3 gap-3 md:gap-4 border-t border-border pt-6 md:pt-8">
              <div className="text-center">
                <Truck className="mx-auto h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                <p className="mt-1 md:mt-2 text-[10px] md:text-xs text-muted-foreground">Free Shipping</p>
              </div>
              <div className="text-center">
                <RefreshCw className="mx-auto h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                <p className="mt-1 md:mt-2 text-[10px] md:text-xs text-muted-foreground">Easy Returns</p>
              </div>
              <div className="text-center">
                <Shield className="mx-auto h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                <p className="mt-1 md:mt-2 text-[10px] md:text-xs text-muted-foreground">Secure Payment</p>
              </div>
            </div>

            {/* Rate this Product */}
            <div className="mt-12 border-t border-border pt-8">
              <h3 className="font-display text-xl font-semibold">Rate this Product</h3>
              <div className="mt-4">
                {!isAuthenticated ? (
                  <p className="text-sm text-muted-foreground">
                    <Link to="/login" className="text-primary hover:underline">Sign in</Link> to rate this product.
                  </p>
                ) : canRate ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">How would you rate this product?</p>
                    <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          disabled={isSubmittingRating}
                          onMouseEnter={() => setHoverRating(star)}
                          onClick={() => submitRating(star)}
                          className="transition-transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                        >
                          <Star
                            className={cn(
                              'h-8 w-8 transition-colors',
                              (hoverRating >= star || (!hoverRating && userRating >= star))
                                ? 'fill-gold text-gold'
                                : 'text-foreground hover:text-gold'
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {ratingReason === 'Already rated by this user'
                      ? 'You have already rated this product. Thank you!'
                      : ratingReason === 'Product not purchased'
                        ? 'You can only rate products you have purchased.'
                        : 'You cannot rate this product at this time.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 md:mt-16 lg:mt-20">
            <h2 className="font-display text-xl md:text-2xl font-semibold">You May Also Like</h2>
            <div className="mt-6 md:mt-8 flex gap-3 md:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
              {relatedProducts.map((product) => (
                <div key={product.id} className="min-w-[160px] max-w-[160px] sm:min-w-[200px] sm:max-w-[200px] md:min-w-[240px] md:max-w-[240px] snap-start flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Also Bought Section */}
        {alsoBought.length > 0 && (
          <div className="mt-12 md:mt-16 lg:mt-20">
            <h2 className="font-display text-xl md:text-2xl font-semibold">Users Also Bought</h2>
            <div className="mt-6 md:mt-8 flex gap-3 md:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
              {alsoBought.map((product) => (
                <div key={product.id} className="min-w-[160px] max-w-[160px] sm:min-w-[200px] sm:max-w-[200px] md:min-w-[240px] md:max-w-[240px] snap-start flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
