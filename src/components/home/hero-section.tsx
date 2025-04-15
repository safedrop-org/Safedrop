
import { useLanguage } from '@/components/ui/language-context';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PackageCheck, Shield, MapPin, Clock } from 'lucide-react';

const HeroSection = () => {
  const { t, language } = useLanguage();

  return (
    <div className="relative bg-safedrop-primary text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTRtMC0xNGMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgNCAxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNG0tMTQgMGMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgNCAxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNG0xNCAxNGMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgNCAxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNCIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className={`md:w-1/2 ${language === 'ar' ? 'md:order-2' : 'md:order-1'}`}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('siteTitle')}
            </h1>
            <p className="text-xl mb-8 text-gray-300 max-w-lg">
              {t('tagline')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-safedrop-gold hover:bg-safedrop-gold/90 text-white">
                <Link to="/register/customer">
                  {t('customerRegister')}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-safedrop-primary">
                <Link to="/register/driver">
                  {t('driverRegister')}
                </Link>
              </Button>
            </div>
          </div>
          <div className={`md:w-1/2 mt-12 md:mt-0 ${language === 'ar' ? 'md:order-1' : 'md:order-2'}`}>
            <div className="relative">
              <div className="relative mx-auto w-full max-w-md">
                <img 
                  src="/lovable-uploads/44f380d5-d61b-4da3-9305-ab3bf3bdff5a.png" 
                  alt="SafeDrop Logo" 
                  className="w-full h-auto object-contain" 
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-all duration-300">
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-safedrop-gold rounded-full mb-4">
                <PackageCheck className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">توصيل آمن</h3>
              <p className="text-sm text-gray-300">سلامة شحنتك هي أولويتنا القصوى في كل مرحلة من مراحل التوصيل</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-all duration-300">
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-safedrop-gold rounded-full mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">ضمان مالي</h3>
              <p className="text-sm text-gray-300">نظام ضمان مدفوعات آمن يضمن وصول شحنتك قبل تحرير الأموال</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-all duration-300">
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-safedrop-gold rounded-full mb-4">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">تتبع مباشر</h3>
              <p className="text-sm text-gray-300">تابع شحنتك في الوقت الفعلي عبر نظام خرائط متطور</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-all duration-300">
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-safedrop-gold rounded-full mb-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">توصيل سريع</h3>
              <p className="text-sm text-gray-300">سائقون معتمدون جاهزون لتوصيل شحناتك بأسرع وقت ممكن</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
