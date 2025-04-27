
import { useLanguage } from '@/components/ui/language-context';
import { PackagePlus, Truck, CreditCard, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
  const { t, language } = useLanguage();

  const steps = [
    {
      icon: <PackagePlus className="h-10 w-10 text-safedrop-gold" />,
      title: {
        ar: "إنشاء طلب",
        en: "Create Order"
      },
      description: {
        ar: "قم بتسجيل طلبك مع تفاصيل الشحنة وموقع الاستلام والتسليم",
        en: "Register your order with package details and pickup/delivery locations"
      }
    },
    {
      icon: <CreditCard className="h-10 w-10 text-safedrop-gold" />,
      title: {
        ar: "إيداع المبلغ",
        en: "Deposit Payment"
      },
      description: {
        ar: "قم بإيداع المبلغ في نظام الضمان المالي للمنصة",
        en: "Deposit the payment in the platform's escrow system"
      }
    },
    {
      icon: <Truck className="h-10 w-10 text-safedrop-gold" />,
      title: {
        ar: "التقاط وتوصيل",
        en: "Pickup & Delivery"
      },
      description: {
        ar: "يقوم السائق المعتمد بالتقاط الشحنة وتوصيلها إلى وجهتها",
        en: "Verified driver picks up the package and delivers it to destination"
      }
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-safedrop-gold" />,
      title: {
        ar: "تأكيد الاستلام",
        en: "Confirm Receipt"
      },
      description: {
        ar: "يؤكد المستلم وصول الشحنة ويتم تحرير المبلغ للسائق",
        en: "Recipient confirms delivery and payment is released to driver"
      }
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-safedrop-primary mb-4">
            {language === 'ar' ? 'كيف تعمل منصة سيف دروب؟' : 'How Does SafeDrop Work?'}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {language === 'ar' 
              ? 'أربع خطوات بسيطة لضمان توصيل آمن ومضمون للشحنات الثمينة'
              : 'Four simple steps for secure and guaranteed delivery of valuable shipments'}
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center"
              >
                {/* Step Number with Icon */}
                <div className="mb-4 relative">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white border-2 border-safedrop-gold shadow-lg mb-4">
                    {step.icon}
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-safedrop-primary text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                
                {/* Step Text */}
                <h3 className="text-xl font-semibold text-safedrop-primary mb-2">
                  {step.title[language]}
                </h3>
                <p className="text-gray-600 text-sm">
                  {step.description[language]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
