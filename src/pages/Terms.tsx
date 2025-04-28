import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

const TermsContent = () => {
  const { language } = useLanguage();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-[#0A192F] py-12 mb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
              {language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            {language === 'ar' ? (
              // Arabic content
              <>
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-safedrop-primary mb-4">1. تعريفات</h2>
                  <ul className="space-y-4 text-gray-700 text-lg">
                    <li className="flex gap-2">
                      <span className="font-semibold">المنصة:</span>
                      <span>تشير إلى "SafeDrop"، وهي منصة إلكترونية تربط بين مستخدمين يرغبون في إرسال شحنات وسائقين مرخصين ومستقلين.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">العميل:</span>
                      <span>هو أي مستخدم يطلب خدمة التوصيل عبر المنصة.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">السائق:</span>
                      <span>هو أي شخص مُسجل ومعتمد من قبل إدارة المنصة لتقديم خدمة التوصيل.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">الشحنة:</span>
                      <span>أي غرض أو طرد يتم طلب توصيله من العميل عبر المنصة.</span>
                    </li>
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
              </>
            ) : (
              // English content
              <>
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-safedrop-primary mb-4">1. Definitions</h2>
                  <ul className="space-y-4 text-gray-700 text-lg">
                    <li className="flex gap-2">
                      <span className="font-semibold">Platform:</span>
                      <span>Refers to "SafeDrop", an electronic platform connecting users who want to send packages with licensed and independent drivers.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">Customer:</span>
                      <span>Any user requesting delivery service through the platform.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">Driver:</span>
                      <span>Any person registered and approved by the platform management to provide delivery service.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">Package:</span>
                      <span>Any item or parcel requested for delivery by the customer through the platform.</span>
                    </li>
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

                <section>
                  <h2 className="text-xl font-semibold text-safedrop-primary mb-4">3. Driver Verification</h2>
                  <ul className="space-y-2 text-gray-700">
                    <li>Driver information is subject to review and approval.</li>
                    <li>Providing services without platform approval is prohibited.</li>
                    <li>The platform reserves the right to suspend or reject a driver's account in case of violations.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-safedrop-primary mb-4">4. Platform Usage</h2>
                  <ul className="space-y-2 text-gray-700">
                    <li>Registration with accurate information is mandatory for all users.</li>
                    <li>Using the platform for illegal activities or transporting prohibited materials is forbidden.</li>
                    <li>Orders cannot be placed without logging in.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-safedrop-primary mb-4">5. Responsibility</h2>
                  <ul className="space-y-2 text-gray-700">
                    <li>The platform is not responsible for package damage or loss after pickup.</li>
                    <li>The customer is responsible for properly packaging the shipment.</li>
                    <li>In case of dispute, the platform intervenes as a facilitator without legal obligation for compensation.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-safedrop-primary mb-4">6. Payments and Commission</h2>
                  <ul className="space-y-2 text-gray-700">
                    <li>Order payment is held until delivery confirmation.</li>
                    <li>A 15% commission is deducted for the platform.</li>
                    <li>Payment is transferred to the driver after customer confirmation of receipt.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-safedrop-primary mb-4">7. Special Conditions</h2>
                  <ul className="space-y-2 text-gray-700">
                    <li>Permanently rejected drivers are not allowed to re-register.</li>
                    <li>The platform reserves the right to suspend accounts that violate terms.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-safedrop-primary mb-4">8. Amendments</h2>
                  <p className="text-gray-700">The platform has the right to modify the terms at any time with notification to users.</p>
                </section>
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
