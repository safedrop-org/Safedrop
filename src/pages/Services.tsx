
import React, { useEffect } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Shield, Truck, Package, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ServicesContent = () => {
  const { t, language } = useLanguage();
  
  useEffect(() => {
    // Ensure the page direction and language are set correctly
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-safedrop-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'ar' ? 'خدماتنا' : 'Our Services'}
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              {language === 'ar' 
                ? 'استكشف مجموعة متنوعة من الخدمات المتميزة التي تقدمها سيف دروب'
                : 'Explore a variety of premium services offered by SafeDrop'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-safedrop-gold hover:bg-safedrop-gold/90 text-white">
                <Link to="/register/customer">
                  {language === 'ar' ? 'تسجيل كعميل' : 'Register as Customer'}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white">
                <Link to="/register/driver">
                  {language === 'ar' ? 'تسجيل كسائق' : 'Register as Driver'}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="w-14 h-14 rounded-full bg-safedrop-primary flex items-center justify-center mb-4">
                    <Package className="h-7 w-7 text-safedrop-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {language === 'ar' ? 'توصيل الطرود' : 'Parcel Delivery'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {language === 'ar' 
                      ? 'خدمة توصيل موثوقة للطرود والشحنات مع ضمان الأمان والسرعة'
                      : 'Reliable delivery service for parcels and shipments with guaranteed security and speed'}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{language === 'ar' ? 'تغطية لجميع المناطق' : 'Coverage for all areas'}</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{language === 'ar' ? 'تغليف آمن' : 'Secure packaging'}</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{language === 'ar' ? 'توصيل مباشر' : 'Direct delivery'}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="w-14 h-14 rounded-full bg-safedrop-primary flex items-center justify-center mb-4">
                    <Shield className="h-7 w-7 text-safedrop-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {language === 'ar' ? 'حماية المعاملات' : 'Transaction Protection'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {language === 'ar'
                      ? 'نظام ضمان مالي آمن يحمي المعاملات ويضمن حقوق جميع الأطراف'
                      : 'Secure financial guarantee system that protects transactions and ensures the rights of all parties'}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{language === 'ar' ? 'الحماية من الاحتيال' : 'Fraud protection'}</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{language === 'ar' ? 'تأكيد الدفع' : 'Payment confirmation'}</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{language === 'ar' ? 'نظام موثوق' : 'Trusted system'}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="w-14 h-14 rounded-full bg-safedrop-primary flex items-center justify-center mb-4">
                    <Clock className="h-7 w-7 text-safedrop-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {language === 'ar' ? 'توصيل سريع' : 'Express Delivery'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {language === 'ar'
                      ? 'خدمة التوصيل السريع للطلبات العاجلة والمهمة بأعلى مستويات الكفاءة'
                      : 'Express delivery service for urgent and important orders with the highest levels of efficiency'}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{language === 'ar' ? 'توصيل في نفس اليوم' : 'Same-day delivery'}</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{language === 'ar' ? 'أولوية التنفيذ' : 'Execution priority'}</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{language === 'ar' ? 'مناسب للطلبات العاجلة' : 'Suitable for urgent orders'}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="w-14 h-14 rounded-full bg-safedrop-primary flex items-center justify-center mb-4">
                    <Truck className="h-7 w-7 text-safedrop-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {language === 'ar' ? 'سائقين موثوقين' : 'Verified Drivers'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {language === 'ar'
                      ? 'جميع سائقينا مدربون ومعتمدون بعد التحقق من هويتهم وسجلهم المهني'
                      : 'All our drivers are trained and certified after verifying their identity and professional record'}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{language === 'ar' ? 'التحقق من الرخصة' : 'License verification'}</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{language === 'ar' ? 'تدريب متخصص' : 'Specialized training'}</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{language === 'ar' ? 'تقييمات عالية' : 'High ratings'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-safedrop-primary mb-6">
              {language === 'ar' ? 'ابدأ مع سيف دروب اليوم' : 'Start with SafeDrop Today'}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {language === 'ar'
                ? 'جرب تجربة توصيل آمنة وسهلة مع سيف دروب'
                : 'Experience safe and easy delivery with SafeDrop'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-safedrop-primary hover:bg-safedrop-primary/90">
                <Link to="/register/customer">
                  {language === 'ar' ? 'تسجيل كعميل' : 'Register as Customer'}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-safedrop-primary text-safedrop-primary hover:bg-safedrop-primary hover:text-white">
                <Link to="/register/driver">
                  {language === 'ar' ? 'تسجيل كسائق' : 'Register as Driver'}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const Services = () => {
  return (
    <LanguageProvider>
      <ServicesContent />
    </LanguageProvider>
  );
};

export default Services;
