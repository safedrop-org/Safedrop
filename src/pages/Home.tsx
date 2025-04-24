
import React from 'react';
import { LanguageProvider } from '@/components/ui/language-context';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { HeroSection } from '@/components/home/hero-section';
import HowItWorks from '@/components/home/how-it-works';
import CallToAction from '@/components/home/call-to-action';

const HomeContent = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <HowItWorks />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

const Home = () => {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
};

export default Home;
