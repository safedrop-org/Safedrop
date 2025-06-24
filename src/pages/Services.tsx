import React, { useEffect } from "react";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Shield, Truck, Package, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ServicesContent = () => {
  const { t, language } = useLanguage();

  useEffect(() => {
    // Ensure the page direction and language are set correctly
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
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
              {language === "ar" ? "خدماتنا" : "Our Services"}
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              {language === "ar"
                ? "استكشف مجموعة متنوعة من الخدمات المتميزة التي تقدمها سيف دروب"
                : "Explore a variety of premium services offered by SafeDrop"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-safedrop-gold hover:bg-safedrop-gold/90 text-white"
              >
                <Link to="/register/customer">
                  {language === "ar" ? "تسجيل كعميل" : "Register as Customer"}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white"
              >
                <Link to="/register/driver">
                  {language === "ar" ? "تسجيل كسائق" : "Register as Driver"}
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
                    {language === "ar" ? "توصيل الطرود" : "Parcel Delivery"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {language === "ar"
                      ? "منصة تتيح ربط العملاء بمقدمي خدمة توصيل موثوقين، مع توفير أدوات تقنية تضمن سهولة الطلب ومتابعته."
                      : "A platform that connects customers with reliable delivery service providers, offering technical tools to ensure easy order placement and tracking."}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "تغطية لجميع المناطق"
                          : "Nationwide coverage"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "وسيلة آمنة للتواصل"
                          : "Secure communication channel"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "ربط مباشر بين الأطراف"
                          : "Direct connection between parties"}
                      </span>
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
                    {language === "ar"
                      ? "حماية المعاملات"
                      : "Transaction Protection"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {language === "ar"
                      ? "تسهل المنصة التعامل بين الطرفين من خلال نظام يوضح شروط الدفع ويضمن حقوق الطرفين."
                      : "The platform facilitates transactions by clarifying payment terms and ensuring the rights of both parties."}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "وضوح تفاصيل الطلب والدفع"
                          : "Clear order and payment details"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "إثبات الاستلام قبل تحرير المبلغ"
                          : "Proof of delivery before releasing payment"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "تعزيز الثقة بين الأطراف"
                          : "Builds trust between users"}
                      </span>
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
                    {language === "ar" ? "توصيل سريع" : "Express Delivery"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {language === "ar"
                      ? "يمكن للمستخدمين نشر طلبات عاجلة، ويطلع عليها السائقون مباشرةً دون تدخل المنصة في التنفيذ."
                      : "Users can post urgent delivery requests, which are immediately visible to drivers without platform interference in execution."}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "إمكانية التوصيل في نفس اليوم حسب توفر السائق"
                          : "Same-day delivery based on driver availability"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "مناسب للطلبات المستعجلة"
                          : "Ideal for urgent requests"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "متاح في جميع الأوقات"
                          : "Available at all times"}
                      </span>
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
                    {language === "ar"
                      ? "سائقون مستقلون"
                      : "Independent Drivers"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {language === "ar"
                      ? "يتمكن السائقون المستقلون من التسجيل في المنصة بعد رفع بياناتهم، وتُعرض تقييماتهم بعد تنفيذ الطلبات."
                      : "Independent drivers can register on the platform by submitting their information, and their ratings are displayed after each completed delivery."}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "التحقق من الهوية والرخصة"
                          : "ID and license verification"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "عرض التقييمات بعد كل توصيل"
                          : "Ratings displayed after each delivery"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "حرية اختيار السائق من قبل العميل"
                          : "Customers can freely choose the most suitable driver"}
                      </span>
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
              {language === "ar"
                ? "انضم الآن إلى سيف دروب"
                : "Join SafeDrop Now"}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {language === "ar"
                ? "واستفد من منصة تقنية ذكية تربطك بسائقين مستقلين لتوصيل احتياجاتك بسرعة وأمان، بكل سهولةومن دون تعقيد."
                : "Benefit from a smart platform that connects you with independent drivers to deliver your needs quickly and safely, with ease and without complexity."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-safedrop-primary hover:bg-safedrop-primary/90"
              >
                <Link to="/register/customer">
                  {language === "ar" ? "تسجيل كعميل" : "Register as Customer"}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-safedrop-primary text-safedrop-primary hover:bg-safedrop-primary hover:text-white"
              >
                <Link to="/register/driver">
                  {language === "ar" ? "تسجيل كسائق" : "Register as Driver"}
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
