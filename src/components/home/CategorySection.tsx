import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/data/mockData';

const CategorySection: React.FC = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-3 text-muted-foreground">
            Find your perfect piece from our curated collections
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.slug}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-display text-lg font-medium text-primary-foreground md:text-xl">
                  {category.name}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-sm text-primary-foreground/80 transition-colors group-hover:text-primary-foreground">
                  <span>Shop Now</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
