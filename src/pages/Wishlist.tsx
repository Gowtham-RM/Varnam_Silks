import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Wishlist = () => {
    const { wishlist } = useWishlist();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 container py-8 md:py-12">
                <div className="mb-8 flex items-center gap-4">
                    <Link to="/shop" className="text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="font-display text-3xl font-semibold">My Wishlist</h1>
                </div>

                {wishlist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h2 className="mt-6 font-display text-2xl font-semibold">Your wishlist is empty</h2>
                        <p className="mt-2 text-muted-foreground max-w-sm">
                            Explore our collection and find some sparklers to add to your wishlist.
                        </p>
                        <Link to="/shop" className="mt-8">
                            <Button variant="hero" size="lg">
                                Start Shopping
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
                        {wishlist.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Wishlist;
