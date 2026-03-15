import React from 'react';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PromoSection from '@/components/home/PromoSection';

const Index: React.FC = () => {
  return (
    <Layout>
      <HeroSection />
      <CategorySection />
      <FeaturedCollections />
      <FeaturedProducts />
      <PromoSection />
    </Layout>
  );
};

export default Index;
