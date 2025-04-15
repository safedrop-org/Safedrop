
type Translations = {
  [key: string]: {
    ar: string;
    en: string;
  };
};

// Define translations for the application
export const translations: Translations = {
  siteTitle: {
    ar: "سيف دروب",
    en: "SafeDrop"
  },
  tagline: {
    ar: "توصيل آمن وأمن ومحمي للأشياء الثمينة",
    en: "Secure delivery of valuable items"
  },
  getStarted: {
    ar: "ابدأ الآن",
    en: "Get Started"
  },
  login: {
    ar: "تسجيل الدخول",
    en: "Log In"
  },
  register: {
    ar: "إنشاء حساب",
    en: "Register"
  },
  registering: {
    ar: "جاري التسجيل...",
    en: "Registering..."
  },
  customerRegister: {
    ar: "تسجيل كعميل",
    en: "Register as Customer"
  },
  driverRegister: {
    ar: "تسجيل كسائق",
    en: "Register as Driver"
  },
  admin: {
    ar: "المشرف",
    en: "Admin"
  },
  customer: {
    ar: "العميل",
    en: "Customer"
  },
  driver: {
    ar: "السائق",
    en: "Driver"
  },
  dashboard: {
    ar: "لوحة التحكم",
    en: "Dashboard"
  },
  orders: {
    ar: "الطلبات",
    en: "Orders"
  },
  createOrder: {
    ar: "إنشاء طلب",
    en: "Create Order"
  },
  trackOrder: {
    ar: "تتبع الطلب",
    en: "Track Order"
  },
  profile: {
    ar: "الملف الشخصي",
    en: "Profile"
  },
  settings: {
    ar: "الإعدادات",
    en: "Settings"
  },
  logout: {
    ar: "تسجيل الخروج",
    en: "Logout"
  },
  services: {
    ar: "خدماتنا",
    en: "Our Services"
  },
  about: {
    ar: "من نحن",
    en: "About Us"
  },
  contact: {
    ar: "اتصل بنا",
    en: "Contact Us"
  },
  footer: {
    ar: "جميع الحقوق محفوظة © سيف دروب 2025",
    en: "All rights reserved © SafeDrop 2025"
  },
  pending: {
    ar: "قيد الانتظار",
    en: "Pending"
  },
  approved: {
    ar: "تمت الموافقة",
    en: "Approved"
  },
  rejected: {
    ar: "مرفوض",
    en: "Rejected"
  },
  inTransit: {
    ar: "قيد التوصيل",
    en: "In Transit"
  },
  delivered: {
    ar: "تم التوصيل",
    en: "Delivered"
  },
  firstName: {
    ar: "الاسم الأول",
    en: "First Name"
  },
  lastName: {
    ar: "اسم العائلة",
    en: "Last Name"
  },
  email: {
    ar: "البريد الإلكتروني",
    en: "Email"
  },
  emailPlaceholder: {
    ar: "أدخل بريدك الإلكتروني",
    en: "Enter your email"
  },
  phone: {
    ar: "رقم الهاتف",
    en: "Phone Number"
  },
  phonePlaceholder: {
    ar: "أدخل رقم هاتفك",
    en: "Enter your phone number"
  },
  password: {
    ar: "كلمة المرور",
    en: "Password"
  },
  alreadyHaveAccount: {
    ar: "لديك حساب بالفعل؟",
    en: "Already have an account?"
  },
  registrationSuccess: {
    ar: "تم التسجيل بنجاح",
    en: "Registration Successful"
  },
  registrationSuccessDescription: {
    ar: "تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول.",
    en: "Your account has been created successfully. You can now log in."
  },
  registrationError: {
    ar: "خطأ في التسجيل",
    en: "Registration Error"
  }
};

export type LanguageKey = 'ar' | 'en';

export const useTranslation = (language: LanguageKey) => {
  return (key: string) => {
    if (!translations[key]) {
      console.warn(`Translation for key "${key}" not found`);
      return key;
    }
    return translations[key][language];
  };
};
