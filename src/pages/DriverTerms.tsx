import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const DriverTermsContent = () => {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-[#0A192F] py-12 mb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
              {language === "ar"
                ? "اتفاقية استخدام السائق"
                : "Driver Terms & Conditions"}
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            {language === "ar" ? (
              // Arabic content
              <>
                <div className="text-center mb-8" dir="rtl">
                  <h2 className="text-2xl font-bold text-safedrop-primary mb-4">
                    اتفاقية استخدام السائق – منصة SafeDrop
                  </h2>
                  <p className="text-gray-700 text-lg">
                    بتسجيلك في منصة SafeDrop، فإنك تُقر وتوافق على ما يلي:
                  </p>
                </div>

                <section className="space-y-6" dir="rtl">
                  <div className="border-r-4 border-safedrop-gold pr-6">
                    <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                      1. دقة المعلومات:
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      أتعهد بتقديم معلومات صحيحة وكاملة عند التسجيل، وأتحمل كامل
                      المسؤولية عن أي معلومات مضللة أو غير صحيحة.
                    </p>
                  </div>

                  <div className="border-r-4 border-safedrop-gold pr-6">
                    <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                      2. الموافقة على مراجعة البيانات:
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      أوافق على أن تخضع بياناتي للمراجعة والتدقيق من قِبل إدارة
                      المنصة قبل تفعيل الحساب.
                    </p>
                  </div>

                  <div className="border-r-4 border-safedrop-gold pr-6">
                    <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                      3. الالتزام بالقوانين:
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      أتعهد بالالتزام بكافة الأنظمة المرورية، والتعليمات
                      الحكومية، والشروط التنظيمية الصادرة عن هيئة النقل.
                    </p>
                  </div>

                  <div className="border-r-4 border-safedrop-gold pr-6">
                    <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                      4. المنع من تقديم الخدمة دون موافقة:
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      لا يجوز لي تقديم أي خدمة توصيل عبر المنصة ما لم يتم تفعيل
                      حسابي رسميًا.
                    </p>
                  </div>

                  <div className="border-r-4 border-safedrop-gold pr-6">
                    <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                      5. السلامة والمسؤولية:
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      أتحمل المسؤولية الكاملة عن سلامة الشحنات أثناء النقل،
                      وأتعهد باتخاذ العناية اللازمة في حفظ وتسليم المقتنيات.
                    </p>
                  </div>

                  <div className="border-r-4 border-safedrop-gold pr-6">
                    <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                      6. العمولة والمدفوعات:
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      أوافق على خصم عمولة 20% من قيمة كل طلب لصالح المنصة، ويتم
                      تحويل المبالغ المستحقة لي بعد تأكيد العميل للاستلام.
                    </p>
                  </div>

                  <div className="border-r-4 border-safedrop-gold pr-6">
                    <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                      7. عدم إعادة التسجيل بعد الحظر:
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      أقر بأنه في حال إيقاف أو حظر حسابي نهائيًا، لا يحق لي
                      التسجيل مجددًا دون إذن خطي من إدارة المنصة.
                    </p>
                  </div>

                  <div className="border-r-4 border-safedrop-gold pr-6">
                    <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                      8. الامتثال لأي تحديثات:
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      أوافق على أن المنصة لها الحق في تحديث الشروط والسياسات،
                      وأني ملزم بالاطلاع والامتثال لأي تعديلات لاحقة.
                    </p>
                  </div>
                </section>

                <div
                  className="bg-safedrop-gold/10 border border-safedrop-gold rounded-lg p-6 mt-8"
                  dir="rtl"
                >
                  <p className="text-safedrop-primary font-bold text-center text-lg">
                    أوافق على جميع الشروط والأحكام المذكورة أعلاه، وأتحمل كامل
                    المسؤولية القانونية والإدارية عند الإخلال بأي بند منها.
                  </p>
                </div>
              </>
            ) : (
              // English content
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-safedrop-primary mb-4">
                    Driver Terms & Conditions – SafeDrop Platform
                  </h2>
                  <p className="text-gray-700 text-lg">
                    By registering on the SafeDrop platform, you acknowledge and
                    agree to the following:
                  </p>
                </div>

                <section className="space-y-6">
                  <div className="border-l-4 border-safedrop-gold pl-6">
                    <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                      1. Accuracy of Information:
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      I undertake to provide accurate and complete information
                      during registration and bear full responsibility for any
                      misleading or incorrect information.
                    </p>
                  </div>

                  <div className="border-l-4 border-safedrop-gold pl-6">
                    <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                      2. Consent to Data Review:
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      I agree that my data will be subject to review and
                      verification by the platform management before account
                      activation.
                    </p>
                  </div>

                  <div className="border-l-4 border-safedrop-gold pl-6">
                    <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                      3. Compliance with Laws:
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      I commit to adhering to all traffic regulations,
                      government instructions, and regulatory conditions issued
                      by the transport authority.
                    </p>
                  </div>

                  <div className="border-l-4 border-safedrop-gold pl-6">
                    <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                      4. Service Provision Restriction:
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      I may not provide any delivery service through the
                      platform unless my account has been officially activated.
                    </p>
                  </div>

                  <div className="border-l-4 border-safedrop-gold pl-6">
                    <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                      5. Safety and Responsibility:
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      I bear full responsibility for the safety of shipments
                      during transport and commit to taking necessary care in
                      preserving and delivering items.
                    </p>
                  </div>

                  <div className="border-l-4 border-safedrop-gold pl-6">
                    <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                      6. Commission and Payments:
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      I agree to a 20% commission deduction from each order
                      value for the platform, with due amounts transferred to me
                      after customer confirmation of receipt.
                    </p>
                  </div>

                  <div className="border-l-4 border-safedrop-gold pl-6">
                    <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                      7. No Re-registration After Ban:
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      I acknowledge that if my account is permanently suspended
                      or banned, I may not re-register without written
                      permission from platform management.
                    </p>
                  </div>

                  <div className="border-l-4 border-safedrop-gold pl-6">
                    <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                      8. Compliance with Updates:
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      I agree that the platform has the right to update terms
                      and policies, and I am obligated to review and comply with
                      any subsequent modifications.
                    </p>
                  </div>
                </section>

                <div className="bg-safedrop-gold/10 border border-safedrop-gold rounded-lg p-6 mt-8">
                  <p className="text-safedrop-primary font-bold text-center text-lg">
                    I agree to all the terms and conditions mentioned above and
                    bear full legal and administrative responsibility for any
                    violation of these terms.
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

const DriverTerms = () => {
  return (
    <LanguageProvider>
      <DriverTermsContent />
    </LanguageProvider>
  );
};

export default DriverTerms;
