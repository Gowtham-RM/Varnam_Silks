import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '@/types';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import api from '@/lib/api';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, size: string, color: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Load cart on mount or auth change
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated && user) {
        try {
          setIsLoading(true);
          const { data } = await api.get(`/cart/${user.id}`); // Assuming backend route is /api/cart/:userId
          // Data from backend might need transformation if not already matching CartItem
          // based on my route implementation, it returns items array directly consistent with frontend
          setItems(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Failed to fetch cart:', error);
          toast.error('Failed to load your cart');
        } finally {
          setIsLoading(false);
        }
      } else {
        // Load from local storage for guests
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            const parsed = JSON.parse(savedCart);
            setItems(Array.isArray(parsed) ? parsed : []);
          } catch (error) {
            console.error('Failed to parse cart from local storage', error);
            localStorage.removeItem('cart');
          }
        } else {
          setItems([]);
        }
      }
    };

    loadCart();
  }, [isAuthenticated, user]);

  // Sync to local storage only if NOT authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isAuthenticated]);

  const addToCart = async (product: Product, quantity: number, size: string, color: string) => {
    if (isAuthenticated && user) {
      try {
        const { data } = await api.post('/cart/add', {
          userId: user.id,
          productId: product.id,
          quantity,
          size,
          color
        });
        setItems(Array.isArray(data) ? data : []); // Backend returns updated list
        toast.success('Added to cart');
      } catch (error) {
        console.error('Failed to add to cart:', error);
        toast.error('Failed to add item to cart');
      }
    } else {
      // Local Logic
      setItems(prev => {
        const existingItem = prev.find(
          item => item.productId === product.id && item.size === size && item.color === color
        );

        if (existingItem) {
          toast.success('Cart updated!');
          return prev.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }

        toast.success('Added to cart!');
        return [
          ...prev,
          {
            id: `cart-${Date.now()}`,
            productId: product.id,
            product,
            quantity,
            size,
            color,
          },
        ];
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (isAuthenticated && user) {
      try {
        await api.post('/cart/remove', { userId: user.id, itemId });
        setItems(prev => prev.filter(item => item.id !== itemId));
        toast.success('Item removed from cart');
      } catch (error) {
        console.error('Failed to remove from cart:', error);
        toast.error('Failed to remove item');
      }
    } else {
      setItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item removed from cart');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    if (isAuthenticated && user) {
      try {
        await api.put('/cart/update', { userId: user.id, itemId, quantity });
        setItems(prev =>
          prev.map(item => (item.id === itemId ? { ...item, quantity } : item))
        );
      } catch (error) {
        console.error('Failed to update quantity:', error);
        toast.error('Failed to update quantity');
      }
    } else {
      setItems(prev =>
        prev.map(item => (item.id === itemId ? { ...item, quantity } : item))
      );
    }
  };

  const clearCart = async () => {
    if (isAuthenticated && user) {
      try {
        await api.post('/cart/clear', { userId: user.id });
        setItems([]);
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    } else {
      setItems([]);
      localStorage.removeItem('cart');
    }
  };

  const getCartTotal = () => {
    return (items || []).reduce((total, item) => total + (item?.product?.price || 0) * (item?.quantity || 0), 0);
  };

  const getCartCount = () => {
    return (items || []).reduce((count, item) => count + (item?.quantity || 0), 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
