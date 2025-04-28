import { useLanguage } from '@/components/ui/language-context';
import { UserCheck, Truck, Package, Star } from 'lucide-react';
const StatSection = () => {
  const {
    t,
    language
  } = useLanguage();
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
  return;
};
export default StatSection;