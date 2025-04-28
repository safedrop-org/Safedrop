
import { useLanguage } from '@/components/ui/language-context';
import { UserCheck, Truck, Package, Star } from 'lucide-react';

const StatSection = () => {
  const { language } = useLanguage();
  
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
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              {stat.icon}
              <div className="mt-4 font-bold text-3xl">{stat.value}</div>
              <div className="text-gray-600">{stat.label[language]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatSection;
