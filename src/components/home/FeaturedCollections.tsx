import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const COLLECTIONS = [
    {
        id: 1,
        title: "Men's Festive",
        description: "Sherwanis & Kurtas",
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500",
        link: "/shop?category=men&sub=ethnic-wear",
        color: "bg-blue-50"
    },
    {
        id: 2,
        title: "Women's Sarees",
        description: "Handwoven Silk & Banarasi",
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500",
        link: "/shop?category=women&sub=sarees",
        color: "bg-rose-50"
    },
    {
        id: 3,
        title: "Kids' Party Wear",
        description: "Dresses & Suits",
        image: "https://images.unsplash.com/photo-1622290291314-1f256e353287?w=500",
        link: "/shop?category=kids",
        color: "bg-green-50"
    }
];

const FeaturedCollections: React.FC = () => {
    return (
        <section className="py-16">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="font-display text-3xl font-semibold md:text-4xl">
                        Curated Collections
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        Handpicked styles for every member of the family
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {COLLECTIONS.map((collection) => (
                        <Link
                            key={collection.id}
                            to={collection.link}
                            className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-elegant transition-all duration-300"
                        >
                            <div className="aspect-[4/5] overflow-hidden">
                                <img
                                    src={collection.image}
                                    alt={collection.title}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90" />

                            <div className="absolute bottom-0 left-0 p-6 text-white translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                                <p className="text-sm font-medium text-white/80 mb-1">{collection.description}</p>
                                <h3 className="font-display text-2xl font-semibold mb-4">{collection.title}</h3>
                                <div className="flex items-center gap-2 text-sm font-medium opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                    <span>Explore Collection</span>
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedCollections;
