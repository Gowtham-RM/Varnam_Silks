import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Award, Users, Sparkles } from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <Layout>
      <div className="container py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">About VARNAM SILKS</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Curating timeless fashion pieces that celebrate femininity and individual style since 2020.
          </p>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card>
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-semibold mb-4">Our Story</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground mb-4">
                  Founded in 2020, VARNAM SILKS has been at the forefront of bringing traditional elegance 
                  to modern fashion. Our journey began with a simple vision: to make authentic, high-quality 
                  ethnic wear accessible to everyone.
                </p>
                <p className="text-muted-foreground mb-4">
                  What started as a small collection of handpicked sarees has now grown into a complete 
                  fashion destination, offering an extensive range of ethnic and contemporary wear for men, 
                  women, and kids. We pride ourselves on sourcing the finest fabrics and working with skilled 
                  artisans to bring you exclusive designs.
                </p>
                <p className="text-muted-foreground">
                  Today, we serve thousands of customers across the country, delivering not just clothing, 
                  but confidence, tradition, and style with every order.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="font-display text-3xl font-semibold text-center mb-8">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="font-display font-semibold mb-2">Customer First</h3>
                <p className="text-sm text-muted-foreground">
                  Your satisfaction is our top priority. We go the extra mile to ensure you have the best experience.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="font-display font-semibold mb-2">Quality Assured</h3>
                <p className="text-sm text-muted-foreground">
                  Every product is carefully selected and inspected to meet our high standards.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="font-display font-semibold mb-2">Community</h3>
                <p className="text-sm text-muted-foreground">
                  Supporting local artisans and craftspeople is at the heart of what we do.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="font-display font-semibold mb-2">Innovation</h3>
                <p className="text-sm text-muted-foreground">
                  Blending tradition with modern technology to serve you better.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mission Section */}
        <div className="max-w-3xl mx-auto text-center">
          <Card className="bg-rose-50 border-rose-200">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                To make traditional and contemporary fashion accessible, affordable, and delightful 
                for everyone, while supporting artisans and preserving the rich heritage of Indian textiles.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AboutUs;
