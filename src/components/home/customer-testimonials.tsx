import { useLanguage } from '@/components/ui/language-context';
import { Star } from 'lucide-react';
const CustomerTestimonials = () => {
  const {
    t,
    language
  } = useLanguage();
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
  return;
};
export default CustomerTestimonials;