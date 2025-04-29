
import { useLanguage } from '@/components/ui/language-context';
import { UserCheck, Truck, Package, Star } from 'lucide-react';

const StatSection = () => {
  const { language } = useLanguage();
  
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
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-safedrop-primary mb-12">
          {language === 'ar' ? 'سيف دروب بالأرقام' : 'SafeDrop in Numbers'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="flex justify-center mb-4">{stat.icon}</div>
              <div className="text-2xl font-bold text-safedrop-primary mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label[language]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatSection;
