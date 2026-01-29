import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya M.',
    location: 'Mumbai',
    rating: 5,
    text: 'Absolutely love the quality and fit! The silk gown I ordered exceeded my expectations. Will definitely shop here again.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  },
  {
    id: 2,
    name: 'Ananya S.',
    location: 'Delhi',
    rating: 5,
    text: 'Best online shopping experience ever. The packaging was beautiful and the dress fit perfectly. Highly recommend!',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
  },
  {
    id: 3,
    name: 'Kavya R.',
    location: 'Bangalore',
    rating: 5,
    text: 'The attention to detail is incredible. Every piece I\'ve bought has become a staple in my wardrobe. Thank you VARNAM SILKS!',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
  },
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 bg-cream">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join thousands of satisfied customers
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="rounded-xl bg-background p-6 shadow-elegant animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-foreground mb-6">{testimonial.text}</p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
