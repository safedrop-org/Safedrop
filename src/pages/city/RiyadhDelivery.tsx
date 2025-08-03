import React from 'react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { SEO } from '@/components/layout/SEO';
import { Shield, Clock, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const RiyadhDelivery = () => {
  const riyadhSchemaData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "سيف دروب - خدمة التوصيل الآمن في الرياض",
    "description": "خدمة توصيل احترافية وآمنة للشحنات الثمينة في الرياض وضواحيها",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "شارع الملك فهد",
      "addressLocality": "الرياض",
      "addressRegion": "منطقة الرياض",
      "postalCode": "11564",
      "addressCountry": "SA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 24.7136,
      "longitude": 46.6753
    },
    "areaServed": [
      "الرياض",
      "الملقا",
      "العليا",
      "الدرعية",
      "الدلم",
      "الخرج"
    ],
    "serviceType": "Delivery Service",
    "url": "https://www.safedropksa.com/riyadh-delivery"
  };

  const riyadhAreas = [
    "حي العليا",
    "حي الملقا", 
    "حي النخيل",
    "حي الياسمين",
    "حي غرناطة",
    "حي الملك فهد",
    "حي السفارات",
    "حي المروج",
    "حي الشفا",
    "حي الصحافة"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="خدمة توصيل آمنة ومضمونة في الرياض - تغطية شاملة لجميع أحياء الرياض | سيف دروب"
        description="خدمة توصيل احترافية وآمنة في الرياض وضواحيها. نغطي جميع أحياء الرياض بما في ذلك العليا، الملقا، النخيل، الياسمين مع ضمان التوصيل الآمن والسريع للشحنات الثمينة."
        keywords="توصيل الرياض, شحن الرياض, توصيل العليا, توصيل الملقا, توصيل النخيل, توصيل الياسمين, خدمة توصيل أحياء الرياض, شحن آمن الرياض, سيف دروب الرياض"
        url="https://www.safedropksa.com/riyadh-delivery"
        canonical="https://www.safedropksa.com/riyadh-delivery"
        schemaData={riyadhSchemaData}
      />
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-safedrop-primary to-safedrop-accent text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                خدمة التوصيل الآمن في الرياض
              </h1>
              <p className="text-xl mb-8 max-w-3xl mx-auto">
                تغطية شاملة لجميع أحياء الرياض مع ضمان التوصيل الآمن والسريع للشحنات الثمينة
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-safedrop-gold hover:bg-safedrop-gold/90">
                  <Link to="/register">احجز الآن</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-safedrop-primary">
                  <Link to="/contact">تواصل معنا</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Coverage Areas */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">نغطي جميع أحياء الرياض</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                خدمة شاملة تصل إلى جميع الأحياء الرئيسية في الرياض وضواحيها
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {riyadhAreas.map((area, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
                  <MapPin className="h-6 w-6 text-safedrop-primary mx-auto mb-2" />
                  <span className="text-sm font-medium">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">لماذا سيف دروب في الرياض؟</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-safedrop-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-safedrop-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">توصيل سريع</h3>
                <p className="text-gray-600">
                  توصيل في نفس اليوم داخل الرياض مع ضمان الوصول في الوقت المحدد
                </p>
              </div>

              <div className="text-center">
                <div className="bg-safedrop-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-safedrop-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">حماية كاملة</h3>
                <p className="text-gray-600">
                  تأمين شامل لجميع الشحنات مع ضمان التعويض في حالة الفقدان أو التلف
                </p>
              </div>

              <div className="text-center">
                <div className="bg-safedrop-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-safedrop-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">خدمة مميزة</h3>
                <p className="text-gray-600">
                  فريق محترف ومدرب لضمان أفضل تجربة توصيل في الرياض
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-safedrop-primary text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              جاهز لتجربة أفضل خدمة توصيل في الرياض؟
            </h2>
            <p className="text-xl mb-8">
              انضم إلى آلاف العملاء الراضين في الرياض
            </p>
            <Button asChild size="lg" className="bg-safedrop-gold hover:bg-safedrop-gold/90">
              <Link to="/register">ابدأ الآن</Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default RiyadhDelivery;
