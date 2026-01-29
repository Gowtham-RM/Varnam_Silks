import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, Heart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const cartCount = getCartCount();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/shop?category=dresses', label: 'Dresses' },
    { href: '/shop?category=tops', label: 'Tops' },
    { href: '/shop?category=accessories', label: 'Accessories' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar */}
      <div className="hidden md:block bg-charcoal text-primary-foreground">
        <div className="container flex h-8 items-center justify-center text-xs tracking-wide">
          <p>Free shipping on orders over ₹2,999 | Use code FIRST10 for 10% off</p>
        </div>
      </div>

      {/* Main header */}
      <div className="container flex h-16 items-center justify-between md:h-20">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Logo */}
        <Link to="/" className="flex items-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            VARNAM SILKS
          </h1>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Wishlist */}
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Heart className="h-5 w-5" />
          </Button>

          {/* Account */}
          {isAuthenticated ? (
            <>
              <Link to={user?.isAdmin ? '/admin' : '/profile'}>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <div
        className={cn(
          'absolute left-0 right-0 top-full border-b border-border bg-background transition-all duration-300',
          isSearchOpen ? 'visible opacity-100' : 'invisible opacity-0'
        )}
      >
        <div className="container py-4">
          <form onSubmit={handleSearch} className="relative mx-auto max-w-xl">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-20"
              autoFocus
            />
            <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'absolute left-0 right-0 top-full z-50 border-b border-border bg-background transition-all duration-300 md:hidden',
          isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
        )}
      >
        <nav className="container flex flex-col py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="py-3 text-base font-medium text-foreground transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="py-3 text-base font-medium text-foreground transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin Dashboard
            </Link>
          )}
          <div className="mt-4 border-t border-border pt-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="block py-3 text-base font-medium text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Account
                </Link>
                <Link
                  to="/orders"
                  className="block py-3 text-base font-medium text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Orders
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-3 text-base font-medium text-foreground"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block py-3 text-base font-medium text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
