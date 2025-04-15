
import { useLanguage } from '@/components/ui/language-context';
import { Star } from 'lucide-react';

const CustomerTestimonials = () => {
  const { t, language } = useLanguage();

  const testimonials = [
    {
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
    },
    {
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
    },
    {
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
    }
  ];

  return (
    <section className="py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-safedrop-primary mb-4">آراء العملاء</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            استمع إلى ما يقوله عملاؤنا عن تجربتهم مع سيف دروب
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name[language]} 
                  className="w-12 h-12 rounded-full object-cover mr-4 rtl:ml-4 rtl:mr-0"
                />
                <div>
                  <h4 className="font-semibold text-safedrop-primary">{testimonial.name[language]}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role[language]}</p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < testimonial.rating ? 'text-safedrop-gold fill-safedrop-gold' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              
              <p className="text-gray-600 italic">"{testimonial.text[language]}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerTestimonials;
