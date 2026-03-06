export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: Address;
  isAdmin: boolean;
  createdAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  subCategory: string;
  sizeType: 'Alpha' | 'Numeric' | 'Kids' | 'Saree';
  fit?: string;
  pattern?: string;
  borderType?: string;
  occasion?: string;
  fabric?: string;
  sizes: { size: string; colors: { color: string; stock: number; inStock: boolean }[] }[];
  colors: string[];
  stock: number;
  images: string[];
  featured?: boolean;
  rating?: number;
  reviews?: number;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface Order {
  id: string;
  userId: string;
  orderItems: OrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  size: string;
  color: string;
  price: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface FilterState {
  category: string;
  subCategory?: string;
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  attributes?: {
    fit?: string[];
    pattern?: string[];
    borderType?: string[];
    occasion?: string[];
    fabric?: string[];
  };
  sortBy: 'newest' | 'price-low' | 'price-high' | 'popular';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
}

// Sales Prediction response types
export interface PredictionItem {
  date: string;
  units: number;
  productId: string;
}

export interface SalesPredictionResponse {
  predictedSales: {
    next7Days: PredictionItem[];
    next30Days: PredictionItem[];
  };
  topSelling: { productId: string; totalSales: number; name: string; image: string }[];
  lowDemand: { productId: string; totalSales: number; name: string; image: string }[];
  recommendations: {
    productId: string;
    name: string;
    image: string;
    predictedUnitsNextWeek: number;
    currentStock: number;
    restockQty: number;
  }[];
}

