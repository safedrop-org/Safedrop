import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Shield, Truck, Package, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ServicesContent = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-safedrop-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">خدماتنا</h1>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              نقدم مجموعة من الخدمات المتكاملة لضمان توصيل آمن وموثوق للطرود الثمينة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg" 
                className="bg-safedrop-gold hover:bg-safedrop-gold/90 text-white"
              >
                <Link to="/register/customer">تسجيل كعميل</Link>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 text-white border-white"
              >
                <Link to="/register/driver">تسجيل كسائق</Link>
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
                  <h3 className="text-xl font-semibold mb-3">توصيل الطرود الثمينة</h3>
                  <p className="text-gray-600 mb-4">
                    خدمة متخصصة لتوصيل الطرود ذات القيمة العالية مثل المجوهرات والإلكترونيات والساعات الثمينة بشكل آمن وموثوق. نضمن وصول الطرد بحالة ممتازة وضمن الوقت المحدد.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>تأمين شامل ضد الفقدان أو التلف</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>تعبئة وتغليف احترافي</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>تتبع مباشر للشحنة</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="w-14 h-14 rounded-full bg-safedrop-primary flex items-center justify-center mb-4">
                    <Shield className="h-7 w-7 text-safedrop-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">حماية المعاملات</h3>
                  <p className="text-gray-600 mb-4">
                    خدمة ضمان المعاملات بين البائع والمشتري، حيث نقوم بدور الوسيط لضمان استلام المشتري للمنتج قبل إتمام الدفع للبائع، مما يوفر الأمان لكلا الطرفين.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>فحص المنتج قبل التسليم</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>ضمان استرداد الأموال</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>توثيق المعاملة بالكامل</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="w-14 h-14 rounded-full bg-safedrop-primary flex items-center justify-center mb-4">
                    <Clock className="h-7 w-7 text-safedrop-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">التوصيل السريع</h3>
                  <p className="text-gray-600 mb-4">
                    خدمة التوصيل خلال ساعات محددة لتلبية احتياجات العملاء العاجلة. نضمن وصول الشحنة في الوقت المحدد مع الحفاظ على معايير الأمان والجودة.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>توصيل في نفس اليوم</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>خدمة التوصيل خلال ساعات</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>تغطية المناطق المركزية</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="w-14 h-14 rounded-full bg-safedrop-primary flex items-center justify-center mb-4">
                    <Truck className="h-7 w-7 text-safedrop-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">سائقون معتمدون</h3>
                  <p className="text-gray-600 mb-4">
                    فريق من السائقين المحترفين المعتمدين الذين تم اختيارهم بعناية وفحصهم بدقة. يت��تع السائقون بخبرة عالية وسجل أمني نظيف لضمان أعلى مستويات الخدمة.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>تحقق شامل من هوية السائقين</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>تدريب مستمر على معايير الخدمة</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>تقييم دوري للأداء</span>
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
              ابدأ رحلتك مع سيف در��ب اليوم
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              سجل الآن واستمتع بتجربة توصيل آمنة ومضمونة لطرودك الثمينة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg" 
                className="bg-safedrop-primary hover:bg-safedrop-primary/90"
              >
                <Link to="/register/customer">تسجيل كعميل</Link>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline" 
                className="border-safedrop-primary text-safedrop-primary hover:bg-safedrop-primary hover:text-white"
              >
                <Link to="/register/driver">تسجيل كسائق</Link>
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
