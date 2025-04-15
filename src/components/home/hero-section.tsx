
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/ui/language-context';

const HeroSection = () => {
  const { t, language } = useLanguage();
  
  return (
    <section className="relative bg-safedrop-primary text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
        <img 
          src="/lovable-uploads/44f380d5-d61b-4da3-9305-ab3bf3bdff5a.png" 
          alt="Hero Background" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="md:w-2/3">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-safedrop-gold">سيف دروب</span> | أول منصة توصيل آمنة للطرود الثمينة
          </h1>
          
          <p className="text-xl mb-8 text-gray-200">
            توصيل آمن ومضمون للطرود والمشتريات الثمينة بين الأفراد مع خدمة الضمان والتحقق
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link to="/register/customer">
              <Button className="bg-safedrop-gold hover:bg-safedrop-gold/90 text-black font-bold px-8 py-6 text-lg">
                {t('joinAsCustomer')}
              </Button>
            </Link>
            
            <Link to="/register/driver">
              <Button variant="outline" className="border-safedrop-gold text-white bg-transparent hover:bg-white/10 font-bold px-8 py-6 text-lg">
                {t('joinAsDriver')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
