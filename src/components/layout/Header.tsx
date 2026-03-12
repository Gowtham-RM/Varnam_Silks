import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, Heart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { NAV_ITEMS } from '@/data/navigation';
import api from '@/lib/api';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [textSuggestions, setTextSuggestions] = useState<string[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { isAuthenticated, user, logout } = useAuth();
  const { getCartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const cartCount = getCartCount();

  React.useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        setTextSuggestions([]);
        return;
      }
      try {
        const res = await api.get(`/products/search?q=${encodeURIComponent(searchQuery)}&autocomplete=true`);
        setSuggestions(res.data.products?.slice(0, 5) || []);
        setTextSuggestions(res.data.textSuggestions || []);
      } catch (e) {
        console.error("Autocomplete error", e);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };



  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
        <nav className="hidden h-full lg:flex items-center gap-6">
          <Link
            to="/shop"
            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Shop
          </Link>
          {NAV_ITEMS.map((item) => (
            <div 
              key={item.label} 
              className="group flex h-full items-center"
              onMouseEnter={() => setActiveMenu(item.label)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                to={item.href}
                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setActiveMenu(null)}
              >
                {item.label}
              </Link>

              {/* Mega Menu Dropdown */}
              {item.columns && activeMenu === item.label && (
                <div className="absolute left-0 top-full w-full border-t border-border bg-background shadow-lg animate-in fade-in zoom-in-95 duration-200">
                  <div className="container py-8">
                    <div className="grid grid-cols-4 gap-8">
                      {item.columns.map((column) => (
                        <div key={column.title}>
                          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                            {column.title}
                          </h3>
                          <ul className="space-y-2">
                            {column.items.map((subItem) => (
                              <li key={subItem.label}>
                                <Link
                                  to={subItem.href}
                                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  {subItem.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {user?.role === 'admin' && (
            <a
              href="/admin"
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Admin
            </a>
          )}
        </nav>

        {/* Search Bar - Desktop */}
        <div className="hidden lg:flex flex-1 max-w-sm mx-8 relative">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setIsSuggestionsOpen(true); }}
              onFocus={() => { if (searchQuery.trim()) setIsSuggestionsOpen(true); }}
              onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 200)}
              className="w-full pl-9 pr-4 bg-muted/40 focus-visible:bg-background rounded-full border-muted-foreground/20"
            />

            {/* Autocomplete Dropdown */}
            {isSuggestionsOpen && (textSuggestions.length > 0 || suggestions.length > 0) && (
              <div className="absolute top-12 left-0 right-0 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50">
                <ul className="py-2">
                  {/* Keyword Suggestions */}
                  {textSuggestions.map((term, i) => (
                    <li key={`text-${i}`}>
                      <button
                        type="button"
                        className="flex items-center px-4 py-2 hover:bg-muted transition-colors w-full text-left"
                        onClick={(e) => {
                          e.preventDefault();
                          setSearchQuery(term);
                          setIsSuggestionsOpen(false);
                          navigate(`/shop?search=${encodeURIComponent(term)}`);
                        }}
                      >
                        <Search className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{term}</span>
                      </button>
                    </li>
                  ))}

                  {textSuggestions.length > 0 && suggestions.length > 0 && (
                    <div className="h-px bg-border my-2 mx-4" />
                  )}

                  {/* Product Suggestions */}
                  {suggestions.map((p) => (
                    <li key={p.id}>
                      <Link
                        to={`/product/${p.id}`}
                        className="flex items-center px-4 py-2 hover:bg-muted transition-colors"
                        onClick={() => { setIsSuggestionsOpen(false); setSearchQuery(''); }}
                      >
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded mr-3" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground line-clamp-1">{p.name}</span>
                          <span className="text-xs text-muted-foreground">₹{p.price}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                  <li className="px-4 py-2 border-t border-border mt-1">
                    <button
                      type="submit"
                      className="text-sm text-primary font-medium hover:underline w-full text-left"
                      onClick={() => setIsSuggestionsOpen(false)}
                    >
                      View all results
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search toggle - Mobile Only */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Wishlist */}
          {/* Wishlist */}
          <Link to="/wishlist" className="hidden md:block">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {wishlistCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Account */}
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' ? (
                <a href="/admin">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </a>
              ) : (
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}
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

      {/* Search bar dropdown - Mobile Only */}
      <div
        className={cn(
          'absolute left-0 right-0 top-full border-b border-border bg-background transition-all duration-300 lg:hidden',
          isSearchOpen ? 'visible opacity-100' : 'invisible opacity-0'
        )}
      >
        <div className="container py-4 relative">
          <form onSubmit={handleSearch} className="relative mx-auto max-w-xl">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setIsSuggestionsOpen(true); }}
              onFocus={() => { if (searchQuery.trim()) setIsSuggestionsOpen(true); }}
              onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 200)}
              className="pl-11 pr-20"
              autoFocus
            />
            <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2">
              Search
            </Button>

            {/* Autocomplete Dropdown (Mobile) */}
            {isSuggestionsOpen && (textSuggestions.length > 0 || suggestions.length > 0) && (
              <div className="absolute top-14 left-4 right-4 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50">
                <ul className="py-2">
                  {/* Keyword Suggestions */}
                  {textSuggestions.map((term, i) => (
                    <li key={`text-m-${i}`}>
                      <button
                        type="button"
                        className="flex items-center px-4 py-3 hover:bg-muted transition-colors border-b border-border/50 w-full text-left"
                        onClick={(e) => {
                          e.preventDefault();
                          setSearchQuery(term);
                          setIsSuggestionsOpen(false);
                          setIsSearchOpen(false);
                          navigate(`/shop?search=${encodeURIComponent(term)}`);
                        }}
                      >
                        <Search className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{term}</span>
                      </button>
                    </li>
                  ))}

                  {/* Product Suggestions */}
                  {suggestions.map((p) => (
                    <li key={p.id}>
                      <Link
                        to={`/product/${p.id}`}
                        className="flex items-center px-4 py-3 hover:bg-muted transition-colors border-b border-border/50 last:border-0"
                        onClick={() => { setIsSuggestionsOpen(false); setIsSearchOpen(false); setSearchQuery(''); }}
                      >
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded mr-3" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground line-clamp-1">{p.name}</span>
                          <span className="text-xs text-muted-foreground">₹{p.price}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                  <li className="px-4 py-3 bg-muted/30">
                    <button
                      type="submit"
                      className="text-sm text-primary font-medium w-full text-center"
                      onClick={() => { setIsSuggestionsOpen(false); setIsSearchOpen(false); }}
                    >
                      See all {searchQuery} results
                    </button>
                  </li>
                </ul>
              </div>
            )}
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
        <nav className="container flex flex-col py-4 h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Static Links */}
          <Link
            to="/"
            className="border-b py-4 text-base font-medium transition-colors hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/shop"
            className="border-b py-4 text-base font-medium transition-colors hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            Shop
          </Link>

          {/* Dynamic Nested Menu */}
          <Accordion type="single" collapsible className="w-full">
            {NAV_ITEMS.map((item) => (
              <AccordionItem key={item.label} value={item.label}>
                <AccordionTrigger className="text-base font-medium">
                  {item.label}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col space-y-4 pl-4">
                    <Link
                      to={item.href}
                      className="text-sm font-medium text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Shop All {item.label}
                    </Link>
                    {item.columns?.map((column) => (
                      <div key={column.title} className="space-y-2">
                        <h4 className="font-medium text-foreground">{column.title}</h4>
                        <ul className="space-y-2 border-l pl-4">
                          {column.items.map((subItem) => (
                            <li key={subItem.label}>
                              <Link
                                to={subItem.href}
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {subItem.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {user?.role === 'admin' && (
            <a
              href="/admin"
              className="border-b py-4 text-base font-medium transition-colors hover:text-primary text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin Dashboard
            </a>
          )}

          <div className="mt-auto border-t border-border pt-4">
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
