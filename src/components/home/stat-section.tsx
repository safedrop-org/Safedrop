
import { useLanguage } from '@/components/ui/language-context';
import { UserCheck, Truck, Package, Star } from 'lucide-react';

const StatSection = () => {
  const { t, language } = useLanguage();

  const stats = [
    {
      icon: <UserCheck className="h-10 w-10 text-safedrop-gold" />,
      value: "100+",
      label: {
        ar: "عملاء سعداء",
        en: "Happy Customers"
      }
    },
    {
      icon: <Truck className="h-10 w-10 text-safedrop-gold" />,
      value: "50+",
      label: {
        ar: "سائق معتمد",
        en: "Verified Drivers"
      }
    },
    {
      icon: <Package className="h-10 w-10 text-safedrop-gold" />,
      value: "500+",
      label: {
        ar: "توصيل ناجح",
        en: "Successful Deliveries"
      }
    },
    {
      icon: <Star className="h-10 w-10 text-safedrop-gold" />,
      value: "4.9",
      label: {
        ar: "تقييم العملاء",
        en: "Customer Rating"
      }
    }
  ];

  return (
    <section className="py-20 bg-safedrop-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">سيف دروب بالأرقام</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            نفخر بتقديم خدمة موثوقة وآمنة لعملائنا، وهذه الأرقام تتحدث عن نجاحنا
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-all duration-300"
            >
              <div className="w-16 h-16 mx-auto flex items-center justify-center bg-safedrop-primary rounded-full mb-4 border-2 border-safedrop-gold">
                {stat.icon}
              </div>
              <div className="text-4xl font-bold mb-2 text-safedrop-gold">
                {stat.value}
              </div>
              <p className="text-gray-300">
                {stat.label[language]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatSection;
