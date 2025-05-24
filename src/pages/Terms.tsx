import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const TermsContent = () => {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-[#0A192F] py-12 mb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
              {language === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            {language === "ar" ? (
              // Arabic content
              <>
                <section className="space-y-6" dir="rtl">
                  <div className="border-r-4 border-safedrop-gold pr-6">
                    <h2 className="text-2xl font-bold text-safedrop-primary mb-4">
                      1. تعريفات
                    </h2>
                    <ul className="space-y-4 text-gray-700 text-lg">
                      <li className="flex gap-2">
                        <span className="font-semibold">المنصة:</span>
                        <span>
                          تشير إلى "SafeDrop"، وهي منصة إلكترونية تربط بين
                          مستخدمين يرغبون في إرسال شحنات وسائقين مرخصين
                          ومستقلين.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold">العميل:</span>
                        <span>هو أي مستخدم يطلب خدمة التوصيل عبر المنصة.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold">السائق:</span>
                        <span>
                          هو أي شخص مُسجل ومعتمد من قبل إدارة المنصة لتقديم خدمة
                          التوصيل.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold">الشحنة:</span>
                        <span>
                          أي غرض أو طرد يتم طلب توصيله من العميل عبر المنصة.
                        </span>
                      </li>
                    </ul>
                  </div>
                </section>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    2. دور المنصة
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      SafeDrop تعمل كوسيط تقني فقط ولا تقدم خدمات التوصيل
                      بنفسها.
                    </li>
                    <li>لا تتحمل المنصة مسؤولية سلامة أو محتوى الشحنات.</li>
                    <li>
                      تقدم المنصة نظام ضمان حجز قيمة الطلب حتى تأكيد الاستلام،
                      ولا يُعد ذلك تأمينًا ماليًا.
                    </li>
                  </ul>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    3. التحقق من السائقين
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>تخضع بيانات السائقين للمراجعة والموافقة.</li>
                    <li>
                      لا يُسمح للسائقين بتقديم خدماتهم دون موافقة رسمية من
                      المنصة.
                    </li>
                    <li>
                      يحق للمنصة تعليق أو إنهاء حساب السائق في حال وجود مخالفات.
                    </li>
                  </ul>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    4. استخدام المنصة
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>يجب التسجيل بمعلومات صحيحة ودقيقة.</li>
                    <li>
                      يُمنع استخدام المنصة لأي أنشطة مخالفة للقانون أو لنقل مواد
                      ممنوعة.
                    </li>
                  </ul>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    5. المسؤولية
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      SafeDrop غير مسؤولة عن أي ضرر أو ضياع للشحنة بعد استلامها
                      من العميل.
                    </li>
                    <li>العميل مسؤول عن تغليف الشحنة بطريقة مناسبة.</li>
                    <li>
                      في حال النزاع، تتدخل المنصة كطرف ميسر فقط دون التزام
                      قانوني بالتعويض.
                    </li>
                  </ul>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    6. المدفوعات والعمولة
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>يتم حجز قيمة الطلب حتى تأكيد الاستلام من العميل.</li>
                    <li>تخصم المنصة عمولة بنسبة 20% من قيمة الطلب.</li>
                    <li>
                      يُحوَّل المبلغ المتبقي للسائق بعد تأكيد العميل استلام
                      الطلب.
                    </li>
                  </ul>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    7. الشروط الخاصة
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>لا يُسمح للسائقين المرفوضين نهائيًا بإعادة التسجيل.</li>
                    <li>تحتفظ المنصة بحق إيقاف الحسابات التي تخرق الشروط.</li>
                  </ul>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    8. التعديلات
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    تحتفظ SafeDrop بحق تعديل الشروط والأحكام في أي وقت، ويتم
                    إشعار المستخدمين بذلك عبر التطبيق أو البريد الإلكتروني.
                  </p>
                </div>

                <div
                  className="bg-safedrop-gold/10 border border-safedrop-gold rounded-lg p-6 mt-8"
                  dir="rtl"
                >
                  <p className="text-safedrop-primary font-bold text-center text-lg">
                    باستخدام منصة SafeDrop، فإنك توافق على جميع الشروط والأحكام
                    المذكورة أعلاه وتتحمل المسؤولية الكاملة عن الالتزام بها.
                  </p>
                </div>
              </>
            ) : (
              // English content
              <>
                <section className="space-y-6">
                  <div className="border-l-4 border-safedrop-gold pl-6">
                    <h2 className="text-2xl font-bold text-safedrop-primary mb-4">
                      1. Definitions
                    </h2>
                    <ul className="space-y-4 text-gray-700 text-lg">
                      <li className="flex gap-2">
                        <span className="font-semibold">Platform:</span>
                        <span>
                          Refers to "SafeDrop," a digital platform that connects
                          users who wish to send shipments with licensed and
                          independent drivers.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold">Customer:</span>
                        <span>
                          Any user who requests delivery service through the
                          platform.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold">Driver:</span>
                        <span>
                          Any individual registered and approved by the
                          platform's management to provide delivery services.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold">Shipment:</span>
                        <span>
                          Any item or parcel requested by the customer for
                          delivery through the platform.
                        </span>
                      </li>
                    </ul>
                  </div>
                </section>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    2. Role of the Platform
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      SafeDrop operates solely as a technology intermediary and
                      does not provide delivery services itself.
                    </li>
                    <li>
                      The platform is not responsible for the safety or contents
                      of shipments.
                    </li>
                    <li>
                      SafeDrop provides a system that holds the payment until
                      the delivery is confirmed, which does not constitute
                      financial insurance.
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    3. Driver Verification
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>Driver data is subject to review and approval.</li>
                    <li>
                      Drivers are not permitted to provide services without
                      official approval from the platform.
                    </li>
                    <li>
                      The platform reserves the right to suspend or terminate
                      driver accounts in the case of violations.
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    4. Use of the Platform
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      Users must register with accurate and truthful
                      information.
                    </li>
                    <li>
                      It is prohibited to use the platform for illegal
                      activities or to transport prohibited materials.
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    5. Liability
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      SafeDrop is not liable for any damage or loss of shipment
                      once it is picked up from the customer.
                    </li>
                    <li>
                      Customers are responsible for proper packaging of their
                      shipments.
                    </li>
                    <li>
                      In case of disputes, the platform may intervene as a
                      facilitator but is not legally obligated to provide
                      compensation.
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    6. Payments and Commission
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      The payment is held until the customer confirms receipt.
                    </li>
                    <li>
                      The platform deducts a 20% commission from the order
                      value.
                    </li>
                    <li>
                      The remaining amount is transferred to the driver after
                      confirmation of receipt by the customer.
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    7. Special Terms
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      Drivers who are permanently rejected may not re-register.
                    </li>
                    <li>
                      The platform reserves the right to suspend accounts that
                      violate the terms.
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    8. Modifications
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    SafeDrop reserves the right to modify these terms and
                    conditions at any time. Users will be notified through the
                    app or via email.
                  </p>
                </div>

                <div className="bg-safedrop-gold/10 border border-safedrop-gold rounded-lg p-6 mt-8">
                  <p className="text-safedrop-primary font-bold text-center text-lg">
                    By using SafeDrop platform, you agree to all the terms and
                    conditions mentioned above and bear full responsibility for
                    compliance with them.
                  </p>
                </div>
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
