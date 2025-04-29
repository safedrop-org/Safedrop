
import { useLanguage } from '@/components/ui/language-context';
import { Star } from 'lucide-react';

const CustomerTestimonials = () => {
  const { t, language } = useLanguage();
  
  const testimonials = [{
    name: {
      ar: "أحمد خالد",
      en: "Ahmed Khalid"
    },
    role: {
      ar: "عميل",
      en: "Customer"
    },
    text: {
      ar: "استخدمت سيف دروب لتوصيل جهاز إلكتروني ثمين، والخدمة كانت ممتازة. التتبع في الوقت الحقيقي أعطاني راحة البال وضمان المبلغ كان فكرة رائعة.",
      en: "I used SafeDrop to deliver an expensive electronic device, and the service was excellent. Real-time tracking gave me peace of mind, and the escrow system was a brilliant idea."
    },
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  }, {
    name: {
      ar: "نورة سعيد",
      en: "Noura Saeed"
    },
    role: {
      ar: "عميل",
      en: "Customer"
    },
    text: {
      ar: "تجربتي مع سيف دروب كانت ممتازة، السائق كان محترفاً والشحنة وصلت بحالة ممتازة وفي الوقت المحدد. سأستخدم المنصة مرة أخرى بالتأكيد.",
      en: "My experience with SafeDrop was excellent. The driver was professional, and the package arrived in perfect condition and on time. I will definitely use the platform again."
    },
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  }, {
    name: {
      ar: "محمد عبد الله",
      en: "Mohammed Abdullah"
    },
    role: {
      ar: "سائق",
      en: "Driver"
    },
    text: {
      ar: "انضممت إلى سيف دروب كسائق منذ ستة أشهر، والمنصة توفر لي فرصاً جيدة للعمل. عملية المراجعة والموافقة كانت شاملة لكنها ضرورية لضمان الجودة.",
      en: "I joined SafeDrop as a driver six months ago, and the platform provides me with good work opportunities. The review and approval process was comprehensive but necessary to ensure quality."
    },
    rating: 4,
    image: "https://randomuser.me/api/portraits/men/36.jpg"
  }];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-safedrop-primary mb-12">
          {language === 'ar' ? 'آراء العملاء' : 'Customer Testimonials'}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-md">
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name[language]} 
                  className="w-12 h-12 rounded-full mr-4" 
                />
                <div>
                  <h4 className="font-medium text-safedrop-primary">{testimonial.name[language]}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role[language]}</p>
                </div>
              </div>
              <div className="mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`inline-block h-4 w-4 ${i < testimonial.rating ? 'text-safedrop-gold fill-safedrop-gold' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <p className="text-gray-700">{testimonial.text[language]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerTestimonials;
