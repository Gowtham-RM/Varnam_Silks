import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

const TestRecommendations = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/products');
                setProducts(data);
                if (data.length > 0) {
                    setSelectedProductId(data[0].id);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!selectedProductId) return;
            try {
                const { data } = await api.get(`/products/${selectedProductId}/recommendations`);
                setRecommendations(data);
            } catch (error) {
                console.error(error);
                setRecommendations([]);
            }
        };
        fetchRecommendations();
    }, [selectedProductId]);

    const currentProduct = products.find((p) => p.id === selectedProductId);

    return (
        <Layout>
            <div className="container py-8">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="font-display text-2xl font-semibold">TF-IDF Recommendation Debugger</h1>
                    <Link to="/shop">
                        <Button variant="outline">Back to Shop</Button>
                    </Link>
                </div>

                {loading ? (
                    <div>Loading products...</div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Control Panel */}
                        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Select Source Product</label>
                                <select
                                    className="w-full rounded-lg border p-2"
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                >
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.category})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {currentProduct && (
                                <div className="rounded-lg bg-muted p-4">
                                    <h3 className="font-semibold">Current Product Details</h3>
                                    <div className="mt-2 space-y-1 text-sm">
                                        <p><span className="text-muted-foreground">Category:</span> {currentProduct.category}</p>
                                        <p><span className="text-muted-foreground">Price:</span> ₹{currentProduct.price}</p>
                                        <p><span className="text-muted-foreground">Colors:</span> {currentProduct.colors.join(', ')}</p>
                                    </div>
                                </div>
                            )}

                            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                                <p className="font-semibold">Algorithm: TF-IDF</p>
                                <p className="mt-1">
                                    Uses Term Frequency-Inverse Document Frequency to find products with similar text descriptions, categories, and colors.
                                </p>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="col-span-2 space-y-4">
                            <h2 className="font-semibold">Top Recommendations</h2>
                            <div className="divide-y rounded-xl border bg-card">
                                {recommendations.map((product, index) => (
                                    <div key={product.id} className="flex items-center gap-4 p-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-mono font-bold text-primary">
                                            #{index + 1}
                                        </div>

                                        <img src={product.images[0]} alt="" className="h-16 w-12 rounded object-cover bg-muted" />

                                        <div className="flex-1">
                                            <h4 className="font-medium">{product.name}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {product.category} • ₹{product.price} • {product.colors.join(', ')}
                                            </p>
                                        </div>

                                        <div className="flex gap-4 text-xs">
                                            {[
                                                { label: 'Name', value: (product as any).breakdown?.name, color: 'text-blue-600' },
                                                { label: 'Cat', value: (product as any).breakdown?.category, color: 'text-green-600' },
                                                { label: 'Desc', value: (product as any).breakdown?.description, color: 'text-purple-600' },
                                                { label: 'Color', value: (product as any).breakdown?.colors, color: 'text-orange-600' },
                                            ].map((item) => (
                                                <div key={item.label} className="text-center">
                                                    <span className={`block font-bold ${item.color}`}>
                                                        {item.value?.toFixed(1) || '0.0'}
                                                    </span>
                                                    <span className="text-muted-foreground">{item.label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-gray-100 font-bold text-xl">
                                            {(product as any).score?.toFixed(1)}
                                        </div>
                                    </div>
                                ))}
                                {recommendations.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground">
                                        No recommendations found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default TestRecommendations;
