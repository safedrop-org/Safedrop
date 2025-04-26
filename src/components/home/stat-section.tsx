
import { useLanguage } from '@/components/ui/language-context';
import { UserCheck, Truck, Package, Star } from 'lucide-react';

const StatSection = () => {
  const { t, language } = useLanguage();
  const stats = [{
    icon: <UserCheck className="h-10 w-10 text-safedrop-gold" />,
    value: "100+",
    label: {
      ar: "عملاء سعداء",
      en: "Happy Customers"
    }
  }, {
    icon: <Truck className="h-10 w-10 text-safedrop-gold" />,
    value: "50+",
    label: {
      ar: "سائق معتمد",
      en: "Verified Drivers"
    }
  }, {
    icon: <Package className="h-10 w-10 text-safedrop-gold" />,
    value: "500+",
    label: {
      ar: "توصيل ناجح",
      en: "Successful Deliveries"
    }
  }, {
    icon: <Star className="h-10 w-10 text-safedrop-gold" />,
    value: "4.9",
    label: {
      ar: "تقييم العملاء",
      en: "Customer Rating"
    }
  }];

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              {stat.icon}
              <h3 className="text-3xl font-bold text-safedrop-primary mt-4">{stat.value}</h3>
              <p className="text-gray-600 mt-2">{stat.label[language as 'ar' | 'en']}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatSection;
