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
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
              {language === "ar"
                ? "اتفاقية استخدام السائق"
                : "Driver Terms & Conditions"}
            </h1>
          </div>
        </div>

        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            {language === "ar" ? (
              // Arabic content
              <>
                <section className="space-y-6" dir="rtl">
                  <div className="bg-gradient-to-r from-safedrop-primary/5 to-safedrop-gold/5 border border-safedrop-gold/20 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-safedrop-primary mb-4 text-center">
                      اتفاقية استخدام السائق – منصة سيف دروب
                    </h2>
                    <p className="text-safedrop-primary text-lg leading-relaxed font-medium text-center">
                      بتسجيلك في منصة سيف دروب، فإنك تُقر وتوافق على ما يلي:
                    </p>
                  </div>
                </section>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    1. دقة المعلومات
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    أتعهد بتقديم معلومات صحيحة وكاملة عند التسجيل في المنصة،
                    وأتحمل كامل المسؤولية عن أي بيانات غير صحيحة أو مضللة قد
                    أقدمها.
                  </p>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    2. الموافقة على مراجعة البيانات
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    أوافق على أن تخضع بياناتي الشخصية والمركبة للمراجعة والتدقيق
                    من قِبل إدارة المنصة قبل تفعيل الحساب، ويحق للمنصة رفض أو
                    تعليق تفعيل الحساب دون إبداء الأسباب.
                  </p>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    3. الالتزام بالأنظمة والتراخيص
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    أقر بأنني حاصل على كافة التراخيص والتصاريح المطلوبة لمزاولة
                    النشاط وفقًا لأنظمة الهيئة العامة للنقل والجهات المختصة، بما
                    في ذلك (بطاقة التشغيل، التأمين النظامي، رخصة القيادة
                    السارية، استمارة المركبة)، وأتحمل المسؤولية الكاملة عن صحتها
                    وسريانها وتجديدها، دون أي مسؤولية على المنصة.
                  </p>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    4. المنع من تقديم الخدمة دون موافقة
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    لا يجوز لي تقديم أي خدمة توصيل عبر المنصة ما لم يتم تفعيل
                    حسابي رسميًا من قبل إدارة المنصة، وألتزم بعدم تجاوز صلاحياتي
                    كمستخدم للمنصة.
                  </p>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    5. السلامة والمسؤولية
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    أتحمل المسؤولية الكاملة عن سلامة المقتنيات أثناء النقل،
                    وأتعهد باتخاذ العناية اللازمة في حفظ وتسليم الطلبات، بما
                    يضمن حقوق العميل ويحترم خصوصيته.
                  </p>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    6. العمولة والمدفوعات
                  </h3>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>
                      أوافق على سداد عمولة المنصة المحددة بنسبة 20% من قيمة
                      الطلب، وتُدفع هذه العمولة بشكل مستقل عبر بوابة الدفع كشرط
                      أساسي لإتاحة التواصل مع العميل داخل المنصة.
                    </p>
                    <p>
                      كما أقر بأن أي مبالغ أخرى يتم الاتفاق عليها مع العميل
                      تُدفع مباشرة لي نقدًا أو وفق ما يتم التفاهم عليه، دون تدخل
                      أو مسؤولية من المنصة.
                    </p>
                  </div>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    7. عدم إعادة التسجيل بعد الحظر
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    أقر بأنه في حال إيقاف أو حظر حسابي نهائيًا، لا يحق لي
                    التسجيل مجددًا في المنصة باستخدام بيانات مختلفة، إلا بموافقة
                    خطية مسبقة من إدارة المنصة.
                  </p>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    8. الامتثال لأي تحديثات
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    أوافق على أن للمنصة الحق في تحديث أو تعديل هذه الشروط
                    والسياسات في أي وقت، وأني ملزم بالاطلاع والامتثال لأي
                    تعديلات لاحقة يتم نشرها عبر التطبيق أو البريد الإلكتروني.
                  </p>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    9. الإقرار بطبيعة العلاقة القانونية
                  </h3>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>
                      أقر وأؤكد أنني أعمل بصفتي سائقًا مستقلاً لا تربطني بالمنصة
                      أي علاقة عمل أو وكالة أو شراكة.
                    </p>
                    <p>
                      كما أقر أن منصة سيف دروب تعمل كوسيط تقني فقط، وتقتصر
                      مسؤوليتها على تمكين التواصل بيني وبين العملاء دون أي
                      التزام أو تدخل في تنفيذ الخدمة أو تحصيل قيمتها أو ضمان
                      جودتها.
                    </p>
                  </div>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    10. التواصل واحترام العملاء
                  </h3>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>
                      أتعهد بالتعامل مع العملاء بكل احترام ومهنية، وعدم إساءة
                      استخدام بياناتهم أو التواصل معهم خارج حدود الخدمة
                      المطلوبة.
                    </p>
                    <p>
                      وأدرك أن أي إساءة أو مخالفة يُمكن أن تؤدي إلى إيقاف حسابي
                      بشكل فوري ودون إشعار مسبق.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              // English content
              <>
                <section className="space-y-6">
                  <div className="bg-gradient-to-r from-safedrop-primary/5 to-safedrop-gold/5 border border-safedrop-gold/20 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-safedrop-primary mb-4 text-center">
                      Driver Terms & Conditions – SafeDrop Platform
                    </h2>
                    <p className="text-safedrop-primary text-lg leading-relaxed font-medium text-center">
                      By registering on SafeDrop platform, you acknowledge and
                      agree to the following:
                    </p>
                  </div>
                </section>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    1. Accuracy of Information
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    I pledge to provide accurate and complete information when
                    registering on the platform, and I bear full responsibility
                    for any incorrect or misleading data I may provide.
                  </p>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    2. Consent to Data Review
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    I agree that my personal and vehicle data may be reviewed
                    and verified by the platform management before activating my
                    account, and the platform has the right to refuse or suspend
                    account activation without providing reasons.
                  </p>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    3. Compliance with Regulations and Licenses
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    I acknowledge that I hold all the required licenses and
                    permits to operate in accordance with the regulations of the
                    General Authority for Transport and relevant authorities,
                    including (operating card, statutory insurance, valid
                    driving license, vehicle registration), and I bear full
                    responsibility for their validity, currency, and renewal,
                    without any liability on the platform.
                  </p>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    4. Prohibition of Service Without Approval
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    I am not permitted to provide any delivery service via the
                    platform unless my account is officially activated by the
                    platform management, and I commit to not exceeding my user
                    privileges on the platform.
                  </p>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    5. Safety and Responsibility
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    I take full responsibility for the safety of the items
                    during transport and pledge to exercise due care in
                    safeguarding and delivering orders, ensuring the customer's
                    rights and respecting their privacy.
                  </p>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    6. Commission and Payments
                  </h3>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>
                      I agree to pay the platform's commission set at 20% of the
                      order value, which is paid independently via the payment
                      gateway as a prerequisite to enable communication with the
                      customer within the platform.
                    </p>
                    <p>
                      I also acknowledge that any other amounts agreed upon with
                      the customer shall be paid directly to me in cash or as
                      otherwise agreed, without any interference or
                      responsibility from the platform.
                    </p>
                  </div>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    7. No Re-registration After Suspension
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    I acknowledge that if my account is permanently suspended or
                    blocked, I am not entitled to re-register on the platform
                    using different data unless I obtain prior written approval
                    from the platform management.
                  </p>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    8. Compliance with Updates
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    I agree that the platform has the right to update or amend
                    these terms and policies at any time, and I am obligated to
                    review and comply with any subsequent changes published via
                    the app or email.
                  </p>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    9. Acknowledgment of Legal Relationship
                  </h3>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>
                      I acknowledge and confirm that I operate as an independent
                      driver and that there is no employment, agency, or
                      partnership relationship between me and the platform.
                    </p>
                    <p>
                      I also acknowledge that SafeDrop acts solely as a
                      technical intermediary, limiting its responsibility to
                      enabling communication between me and the customers
                      without any obligation or interference in service
                      execution, fee collection, or quality assurance.
                    </p>
                  </div>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h3 className="text-xl font-bold text-safedrop-primary mb-3">
                    10. Communication and Respect for Customers
                  </h3>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>
                      I pledge to deal with customers respectfully and
                      professionally, without misusing their data or
                      communicating beyond the scope of the requested service.
                    </p>
                    <p>
                      I understand that any abuse or violation may result in
                      immediate suspension of my account without prior notice.
                    </p>
                  </div>
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
