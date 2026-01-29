import React from 'react';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PromoSection from '@/components/home/PromoSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';

const Index: React.FC = () => {
  return (
    <Layout>
      <HeroSection />
      <CategorySection />
      <FeaturedProducts />
      <PromoSection />
      <TestimonialsSection />
    </Layout>
  );
};

export default Index;
