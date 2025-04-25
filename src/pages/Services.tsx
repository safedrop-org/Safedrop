import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Shield, Truck, Package, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
const ServicesContent = () => {
  const {
    t
  } = useLanguage();
  return <div className="min-h-screen flex flex-col">
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
              <Button asChild size="lg" className="bg-safedrop-gold hover:bg-safedrop-gold/90 text-white">
                <Link to="/register/customer">تسجيل كعميل</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white">
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
                  <h3 className="text-xl font-semibold mb-3">توصيل الطرود</h3>
                  <p className="text-gray-600 mb-4">نقدّم خدمة توصيل الطرود بكل أمان وسرعة إلى باب العميل، مع تغليف محكم وتحديثات مستمرة، لضمان أن تصل شحنتك بحالة ممتازة وفي الوقت الذي تريده تمامًا.</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>التوصيل إلى جميع المناطق في السعودية</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>تغليف آمن ومحكم</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>تسليم مباشر للمستلم</span>
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
                  <p className="text-gray-600 mb-4">نؤمن تعاملاتك من خلال نظام ضمان مالي (Escrow) يحفظ أموالك حتى يتم تأكيد استلام الطرد، مما يوفّر تجربة موثوقة وعادلة للطرفين ويمنع أي محاولة احتيال أو تلاعب.</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>حماية من الاحتيال</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>تأكيد قبل تحرير الدفع</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span> نظام موثوق ومعتمد</span>
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
                  <p className="text-gray-600 mb-4">نوفّر لك خدمة توصيل سريعة وفعالة في نفس اليوم أو خلال ساعات، لتلبية احتياجاتك الطارئة بسهولة واحترافية مع أولوية كاملة في التنفيذ والتوصيل.</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>تسليم بنفس اليوم</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>أولوية في التنفيذ</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>مناسب للطلبات المستعجلة</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="w-14 h-14 rounded-full bg-safedrop-primary flex items-center justify-center mb-4">
                    <Truck className="h-7 w-7 text-safedrop-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">تتبع الشحنات</h3>
                  <p className="text-gray-600 mb-4">فريق من السائقين المحترفين المعتمدين الذين تم وفحصهم بعناية بدقيمكنك متابعة حالة شحنتك في كل مرحلة من مراحل التوصيل، حيث يقوم السائق بتحديث حالتها باستمرار لضمان معرفة وضع الطلب حتى لحظة التسليم.ة. يتمتع السائقون بخبرة عالية وسجل أمني نظيف لضمان أعلى مستويات الخدمة.</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>إشعارات فورية بالحالة
                    </span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span> تحديث يدوي من السائق</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>وضوح في كل مرحلة</span>
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
            <h2 className="text-3xl font-bold text-safedrop-primary mb-6">ابدأ رحلتك مع سيف دروب اليوم</h2>
            <p className="text-xl text-gray-600 mb-8">
              سجل الآن واستمتع بتجربة توصيل آمنة ومضمونة لطرودك الثمينة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-safedrop-primary hover:bg-safedrop-primary/90">
                <Link to="/register/customer">تسجيل كعميل</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-safedrop-primary text-safedrop-primary hover:bg-safedrop-primary hover:text-white">
                <Link to="/register/driver">تسجيل كسائق</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
};
const Services = () => {
  return <LanguageProvider>
      <ServicesContent />
    </LanguageProvider>;
};
export default Services;