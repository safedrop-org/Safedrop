
import React, { useEffect } from 'react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { HeroSection } from '@/components/home/hero-section';
import HowItWorks from '@/components/home/how-it-works';
import CallToAction from '@/components/home/call-to-action';
import { useLanguage } from '@/components/ui/language-context';
import { SEO } from '@/components/layout/SEO';

const Home = () => {
  const { language } = useLanguage();

  useEffect(() => {
    // Ensure the page direction and language are set correctly
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const homeSchemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "سيف دروب - SafeDrop KSA",
    "alternateName": "SafeDrop KSA",
    "url": "https://www.safedropksa.com",
    "logo": "https://www.safedropksa.com/logo-safedrop-ksa.png",
    "description": "خدمة توصيل احترافية وآمنة للشحنات الثمينة والمهمة في المملكة العربية السعودية",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "شارع الملك فهد",
      "addressLocality": "الرياض",
      "addressRegion": "منطقة الرياض",
      "postalCode": "11564",
      "addressCountry": "SA"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+966-11-123-4567",
      "contactType": "customer service",
      "availableLanguage": ["Arabic", "English"]
    },
    "areaServed": {
      "@type": "Country",
      "name": "المملكة العربية السعودية"
    },
    "sameAs": [
      "https://twitter.com/safedropksa",
      "https://instagram.com/safedropksa",
      "https://linkedin.com/company/safedropksa"
    ],
    "serviceType": "Delivery Service",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "خدمات التوصيل",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "توصيل الشحنات الثمينة",
            "description": "خدمة توصيل آمنة ومؤمنة للمجوهرات والإلكترونيات والوثائق المهمة"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "التوصيل السريع",
            "description": "خدمة توصيل سريعة في نفس اليوم لجميع أنحاء المملكة"
          }
        }
      ]
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="سيف دروب - خدمة توصيل آمنة ومضمونة للشحنات الثمينة في السعودية"
        description="خدمة توصيل احترافية وآمنة للشحنات الثمينة والمهمة في المملكة العربية السعودية. توصيل سريع، تأمين شامل، وتتبع مباشر لشحناتك مع سيف دروب - الحل الأمثل للتوصيل الآمن في الرياض، جدة، الدمام وجميع أنحاء المملكة."
        keywords="توصيل آمن السعودية, شحن الرياض, توصيل جدة, شحنات ثمينة, توصيل مضمون, خدمة شحن احترافية, تأمين الشحنات, توصيل سريع السعودية, SafeDrop KSA, سيف دروب, شحن الدمام, توصيل المدينة المنورة, توصيل مكة المكرمة"
        url="https://www.safedropksa.com/"
        canonical="https://www.safedropksa.com/"
        schemaData={homeSchemaData}
      />
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

export default Home;
