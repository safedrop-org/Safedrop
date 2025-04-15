
import { useState, useEffect } from 'react';
import { LanguageProvider } from '@/components/ui/language-context';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import HeroSection from '@/components/home/hero-section';
import HowItWorks from '@/components/home/how-it-works';
import StatSection from '@/components/home/stat-section';
import CustomerTestimonials from '@/components/home/customer-testimonials';
import CallToAction from '@/components/home/call-to-action';

const Index = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <HeroSection />
          <HowItWorks />
          <StatSection />
          <CustomerTestimonials />
          <CallToAction />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Index;
