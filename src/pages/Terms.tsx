import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

const TermsContent = () => {
  const { language } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-safedrop-primary mb-8 text-center">
            {language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
          </h1>
          
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
            {language === 'ar' ? (
              // Arabic content
              <section>
                <h2 className="text-xl font-semibold text-safedrop-primary mb-4">1. تعريفات</h2>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>المنصة:</strong> تشير إلى "SafeDrop"، وهي منصة إلكترونية تربط بين مستخدمين يرغبون في إرسال شحنات وسائقين مرخصين ومستقلين.</li>
                  <li><strong>العميل:</strong> هو أي مستخدم يطلب خدمة التوصيل عبر المنصة.</li>
                  <li><strong>السائق:</strong> هو أي شخص مُسجل ومعتمد من قبل إدارة المنصة لتقديم خدمة التوصيل.</li>
                  <li><strong>الشحنة:</strong> أي غرض أو طرد يتم طلب توصيله من العميل عبر المنصة.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-safedrop-primary mb-4">2. دور المنصة</h2>
                <ul className="space-y-2 text-gray-700">
                  <li>SafeDrop تعمل كـ وسيط تقني بين العميل والسائق.</li>
                  <li>لا تقدم خدمات النقل بنفسها ولا تتحمل مسؤولية محتوى أو سلامة الشحنات.</li>
                  <li>تقدم المنصة نظام ضمان لحجز المبلغ حتى تأكيد الاستلام، وليس تأمينًا ماليًا.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-safedrop-primary mb-4">3. التحقق من السائقين</h2>
                <ul className="space-y-2 text-gray-700">
                  <li>تخضع بيانات السائقين للمراجعة والموافقة.</li>
                  <li>يُمنع تقديم الخدمات دون موافقة المنصة.</li>
                  <li>يحق للمنصة تعليق أو رفض حساب السائق في حال وجود مخالفات.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-safedrop-primary mb-4">4. استخدام المنصة</h2>
                <ul className="space-y-2 text-gray-700">
                  <li>التسجيل بمعلومات صحيحة إلزامي لجميع المستخدمين.</li>
                  <li>يُمنع استخدام المنصة في أنشطة غير قانونية أو لنقل مواد محظورة.</li>
                  <li>لا يمكن تقديم طلب بدون تسجيل دخول.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-safedrop-primary mb-4">5. المسؤولية</h2>
                <ul className="space-y-2 text-gray-700">
                  <li>المنصة غير مسؤولة عن تلف أو ضياع الشحنة بعد استلامها.</li>
                  <li>العميل مسؤول عن تغليف الشحنة جيدًا.</li>
                  <li>في حال النزاع، تتدخل المنصة كميسر دون التزام قانوني بالتعويض.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-safedrop-primary mb-4">6. المدفوعات والعمولة</h2>
                <ul className="space-y-2 text-gray-700">
                  <li>يتم حجز قيمة الطلب حتى تأكيد الاستلام.</li>
                  <li>يتم خصم عمولة 15% لصالح المنصة.</li>
                  <li>يتم تحويل المبلغ للسائق بعد تأكيد العميل للاستلام.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-safedrop-primary mb-4">7. الشروط الخاصة</h2>
                <ul className="space-y-2 text-gray-700">
                  <li>لا يُسمح بإعادة تسجيل السائقين المرفوضين نهائيًا.</li>
                  <li>المنصة تحتفظ بحق إيقاف الحسابات المخالفة.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-safedrop-primary mb-4">8. التعديلات</h2>
                <p className="text-gray-700">للمنصة الحق في تعديل الشروط في أي وقت مع إشعار المستخدمين.</p>
              </section>
            ) : (
              // English content
              <>
                <section>
                  <h2 className="text-xl font-semibold text-safedrop-primary mb-4">1. Definitions</h2>
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Platform:</strong> Refers to "SafeDrop", an electronic platform connecting users who want to send packages with licensed and independent drivers.</li>
                    <li><strong>Customer:</strong> Any user requesting delivery service through the platform.</li>
                    <li><strong>Driver:</strong> Any person registered and approved by the platform management to provide delivery service.</li>
                    <li><strong>Package:</strong> Any item or parcel requested for delivery by the customer through the platform.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-safedrop-primary mb-4">2. Platform Role</h2>
                  <ul className="space-y-2 text-gray-700">
                    <li>SafeDrop operates as a technical intermediary between the customer and driver.</li>
                    <li>Does not provide transport services itself and is not responsible for package content or safety.</li>
                    <li>Provides a guarantee system to hold payment until delivery confirmation, not financial insurance.</li>
                  </ul>
                </section>

                {/* Add more sections as needed */}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Terms = () => {
  return (
    <LanguageProvider>
      <TermsContent />
    </LanguageProvider>
  );
};

export default Terms;
