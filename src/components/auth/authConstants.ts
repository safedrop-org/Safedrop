// Constants
export const AUTH_CONSTANTS = {
  DUPLICATE_EMAIL_MESSAGE: "هذا البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول.",
  DUPLICATE_EMAIL_TOAST: "هذا البريد الإلكتروني مسجل بالفعل",
  CURRENT_LANGUAGE: "ar" as const,
  LOGO_SRC: "/lovable-uploads/abbaa84d-9220-43c2-833e-afb017f5a986.png",
  COOKIE_EXPIRES: 1 / 24, // 1 hour
  MIN_NAME_LENGTH: 2,
  MIN_PHONE_LENGTH: 10,
  MIN_PASSWORD_LENGTH: 8,
  
  // Error Messages
  ERROR_MESSAGES: {
    WAIT_MESSAGE: (time: number) => `يرجى الانتظار ${time} ثانية قبل المحاولة مرة أخرى`,
    TERMS_REQUIRED: {
      ar: "يجب الموافقة على الشروط والأحكام",
      en: "You must accept the terms and conditions"
    },
    ACCOUNT_CREATION_FAILED: "فشل إنشاء الحساب، يرجى المحاولة مرة أخرى",
    UNEXPECTED_ERROR: "حدث خطأ غير متوقع أثناء التسجيل، يرجى المحاولة مرة أخرى",
    ACCOUNT_CREATION_ERROR: (message: string) => `خطأ أثناء إنشاء الحساب: ${message}`,
    RATE_LIMIT: "تم تجاوز الحد المسموح للتسجيل، يرجى الانتظار دقيقة واحدة قبل المحاولة مرة أخرى"
  },

  // Validation Rules
  VALIDATION_RULES: {
    MIN_NAME_LENGTH: 2,
    MIN_PHONE_LENGTH: 10,
    MIN_PASSWORD_LENGTH: 8,
    MIN_NATIONAL_ID_LENGTH: 10,
    MIN_LICENSE_LENGTH: 5,
    MIN_VEHICLE_INFO_LENGTH: 2,
    MIN_PLATE_NUMBER_LENGTH: 4,
    YEAR_REGEX: /^\d{4}$/
  } as const,
} as const;

// Types
export interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  user_type: string;
}
