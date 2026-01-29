import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Add with default size and color
    addToCart(product, 1, product.sizes[0], product.colors[0]);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className={cn('group block', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
        {/* Image */}
        <img
          src={product.images[isHovered && product.images[1] ? 1 : 0]}
          alt={product.name}
          className={cn(
            'h-full w-full object-cover transition-all duration-700',
            isHovered ? 'scale-105' : 'scale-100',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
              -{discount}%
            </span>
          )}
          {product.stock < 10 && product.stock > 0 && (
            <span className="rounded-full bg-gold px-2 py-1 text-xs font-medium text-foreground">
              Low Stock
            </span>
          )}
          {product.stock === 0 && (
            <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={cn(
            'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur transition-all duration-300',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              isWishlisted ? 'fill-primary text-primary' : 'text-foreground'
            )}
          />
        </button>

        {/* Quick add button */}
        <div
          className={cn(
            'absolute bottom-3 left-3 right-3 transition-all duration-300',
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
        >
          <Button
            onClick={handleQuickAdd}
            variant="hero"
            className="w-full"
            disabled={product.stock === 0}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Quick Add
          </Button>
        </div>
      </div>

      {/* Product info */}
      <div className="mt-4 space-y-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {product.category}
        </p>
        <h3 className="font-display text-base font-medium leading-tight text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-base font-semibold text-foreground">
            ₹{product.price.toLocaleString()}
          </p>
          {product.originalPrice && (
            <p className="text-sm text-muted-foreground line-through">
              ₹{product.originalPrice.toLocaleString()}
            </p>
          )}
        </div>
        {product.rating && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-gold text-gold" />
            <span className="text-xs text-muted-foreground">
              {product.rating} ({product.reviews})
            </span>
          </div>
        )}
        {/* Color swatches */}
        <div className="flex gap-1 pt-1">
          {product.colors.slice(0, 4).map((color) => (
            <span
              key={color}
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
              title={color}
            />
          ))}
          {product.colors.length > 4 && (
            <span className="text-xs text-muted-foreground">+{product.colors.length - 4}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
