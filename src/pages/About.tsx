import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import StatSection from '@/components/home/stat-section';
import { Award, Target, Users, Shield } from 'lucide-react';
const AboutContent = () => {
  const {
    t
  } = useLanguage();
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-safedrop-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">من نحن</h1>
            <p className="text-xl max-w-3xl mx-auto">
              سيف دروب هي منصة متخصصة في توفير خدمات التوصيل الآمن للطرود والمشتريات الثمينة
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-safedrop-primary">قصتنا</h2>
                <p className="text-gray-700 mb-4">جاءت فكرتنا من حاجة حقيقية لنظام توصيل يحمي الممتلكات الشخصية ويوفر للناس راحة البال. أردنا تقديم تجربة مختلفة، أكثر أمانًا وشفافية من الطرق التقليدية.</p>
                <p className="text-gray-700 mb-4">أنشأنا SafeDrop لنكون حلًا موثوقًا لكل من يحتاج إلى توصيل آمن وسهل. اعتمدنا على البساطة، الوضوح، ونظام حماية مالي لضمان حقوق الجميع.</p>
                <p className="text-gray-700">نطمح لأن نصبح المنصة الأولى في توصيل الممتلكات الشخصية عبر سائقين موثوقين ونظام متكامل. نسعى دائمًا للتطوير وتقديم الأفضل لمستخدمينا.</p>
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img alt="About SafeDrop" className="w-full h-auto" src="/lovable-uploads/b85743d1-b412-4dd7-8c3c-de2c2dfb08bd.png" />
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-safedrop-primary">قيمنا</h2>
              <p className="mt-4 text-lg text-gray-600">المبادئ التي نعمل بها كل يوم</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-safedrop-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-safedrop-gold" />
                </div>
                <h3 className="text-xl font-semibold mb-3">الأمان</h3>
                <p className="text-gray-600">
                  نضع أمان العملاء والمنتجات في مقدمة أولوياتنا. نتخذ كافة الإجراءات لضمان حماية كاملة.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-safedrop-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-safedrop-gold" />
                </div>
                <h3 className="text-xl font-semibold mb-3">الجودة</h3>
                <p className="text-gray-600">نلتزم بتقديم خدمة عالية الجودة في كل تفاصيلها، من اختيار السائقين إلى تسليم الشحنات.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-safedrop-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-safedrop-gold" />
                </div>
                <h3 className="text-xl font-semibold mb-3">الشفافية</h3>
                <p className="text-gray-600">
                  نؤمن بالشفافية التامة في تعاملاتنا. نوفر متابعة مستمرة ومعلومات واضحة في كل مرحلة.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-safedrop-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-safedrop-gold" />
                </div>
                <h3 className="text-xl font-semibold mb-3">الابتكار</h3>
                <p className="text-gray-600">
                  نسعى دائماً لتطوير خدماتنا وتقديم حلول مبتكرة تلبي احتياجات عملائنا المتنوعة.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <StatSection />
      </main>
      <Footer />
    </div>;
};
const About = () => {
  return <LanguageProvider>
      <AboutContent />
    </LanguageProvider>;
};
export default About;