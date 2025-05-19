import { TranslationSection } from "./types";

export const authUI: TranslationSection = {
  // Authentication & Common UI
  Dashboard: {
    ar: "لوحة التحكم",
    en: "Dashboard",
  },
  "New Order": {
    ar: "طلب جديد",
    en: "New Order",
  },
  "My Orders": {
    ar: "طلباتي",
    en: "My Orders",
  },
  "Billing & Payment": {
    ar: "الفواتير والدفع",
    en: "Billing & Payment",
  },
  Profile: {
    ar: "الملف الشخصي",
    en: "Profile",
  },
  "Technical Support": {
    ar: "الدعم الفني",
    en: "Technical Support",
  },
  "Feedback & Rating": {
    ar: "التقييم والملاحظات",
    en: "Feedback & Rating",
  },
  Settings: {
    ar: "الإعدادات",
    en: "Settings",
  },
  Logout: {
    ar: "تسجيل الخروج",
    en: "Logout",
  },

  // Welcome message for dashboard
  welcomeCustomerDashboard: {
    ar: "مرحبًا بك في لوحة تحكم العميل",
    en: "Welcome to your Customer Dashboard",
  },

  // Admin authentication messages
  adminAuthRequired: {
    ar: "يجب تسجيل الدخول للوصول إلى لوحة التحكم",
    en: "Login required to access admin dashboard",
  },
  adminCheckError: {
    ar: "حدث خطأ أثناء التحقق من صلاحيات المشرف",
    en: "Error checking admin permissions",
  },
  adminLoggedOut: {
    ar: "تم تسجيل خروجك من لوحة التحكم",
    en: "You have been logged out from admin dashboard",
  },
  adminLoginDescription: {
    ar: "أدخل كلمة المرور للوصول إلى لوحة تحكم المشرف",
    en: "Enter password to access admin panel",
  },
  adminLogin: {
    ar: "تسجيل دخول المشرف",
    en: "Admin Login",
  },

  // Login page translations
  login: {
    ar: "تسجيل الدخول",
    en: "Login",
  },
  loginDescription: {
    ar: "دخول إلى حسابك في منصة سيف دروب",
    en: "Access your SafeDrop account",
  },
  email: {
    ar: "البريد الإلكتروني",
    en: "Email",
  },
  password: {
    ar: "كلمة المرور",
    en: "Password",
  },
  rememberMe: {
    ar: "تذكرني",
    en: "Remember me",
  },
  forgotPassword: {
    ar: "نسيت كلمة المرور؟",
    en: "Forgot password?",
  },
  loggingIn: {
    ar: "جاري تسجيل الدخول...",
    en: "Logging in...",
  },
  noAccount: {
    ar: "ليس لديك حساب؟",
    en: "Don't have an account?",
  },
  registerAsCustomer: {
    ar: "سجل كعميل",
    en: "Register as customer",
  },
  registerAsDriver: {
    ar: "سجل كسائق",
    en: "Register as driver",
  },
  invalidCredentials: {
    ar: "بيانات الدخول غير صحيحة، يرجى التحقق من البريد الإلكتروني وكلمة المرور",
    en: "Invalid login credentials. Please check your email and password",
  },
  emailNotConfirmed: {
    ar: "البريد الإلكتروني غير مؤكد، يرجى التحقق من بريدك الإلكتروني وتأكيد حسابك",
    en: "Email not confirmed. Please check your email and confirm your account",
  },
  loginError: {
    ar: "حدث خطأ أثناء تسجيل الدخول",
    en: "An error occurred during login",
  },
  loginSuccess: {
    ar: "تم تسجيل الدخول بنجاح، مرحباً بك",
    en: "Login successful, welcome back",
  },
  logout: {
    ar: "تسجيل الخروج",
    en: "Logout",
  },
  logoutSuccess: {
    ar: "تم تسجيل الخروج بنجاح",
    en: "Logged out successfully",
  },
  logoutError: {
    ar: "حدث خطأ أثناء تسجيل الخروج",
    en: "An error occurred during logout",
  },
  pleaseEnterEmailPassword: {
    ar: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
    en: "Please enter your email and password",
  },
  loginAsAdmin: {
    ar: "تم تسجيل الدخول كمسؤول",
    en: "Logged in as admin",
  },
  failedToGetUserInfo: {
    ar: "فشل الحصول على معلومات المستخدم",
    en: "Failed to get user information",
  },
  unknownUserType: {
    ar: "نوع المستخدم غير معروف",
    en: "Unknown user type",
  },
  profileCheckError: {
    ar: "حدث خطأ أثناء التحقق من الملف الشخصي",
    en: "Error checking profile",
  },
  loading: {
    ar: "جاري التحميل...",
    en: "Loading...",
  },

  // Password reset translations
  forgotPasswordTitle: {
    ar: "استعادة كلمة المرور",
    en: "Forgot Password",
  },
  forgotPasswordDescription: {
    ar: "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور",
    en: "Enter your email and we'll send you a password reset link",
  },
  pleaseEnterEmail: {
    ar: "يرجى إدخال البريد الإلكتروني",
    en: "Please enter your email",
  },
  sending: {
    ar: "جاري الإرسال...",
    en: "Sending...",
  },
  sendResetLink: {
    ar: "إرسال رابط إعادة التعيين",
    en: "Send Reset Link",
  },
  backToLogin: {
    ar: "العودة إلى تسجيل الدخول",
    en: "Back to Login",
  },
  passwordResetError: {
    ar: "حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور",
    en: "An error occurred sending the password reset link",
  },
  passwordResetEmailSent: {
    ar: "تم إرسال رابط إعادة تعيين كلمة المرور",
    en: "Password reset link sent",
  },
  passwordResetEmailSentDescription: {
    ar: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك.",
    en: "A password reset link has been sent to your email. Please check your inbox.",
  },
  resetPasswordTitle: {
    ar: "إعادة تعيين كلمة المرور",
    en: "Reset Password",
  },
  resetPasswordDescription: {
    ar: "أدخل كلمة المرور الجديدة",
    en: "Enter your new password",
  },
  resetPasswordSecurityNote: {
    ar: "أدخل كلمة المرور الجديدة",
    en: "Enter your new password",
  },

  verifyingResetLink: {
    ar: "جاري التحقق من رابط إعادة التعيين...",
    en: "Verifying reset link...",
  },
  passwordUpdated: {
    ar: "تم تحديث كلمة المرور",
    en: "Password Updated",
  },
  passwordSuccessfullyReset: {
    ar: "تم إعادة تعيين كلمة المرور بنجاح",
    en: "Password successfully reset",
  },
  missingToken: {
    ar: "الرمز مفقود في الرابط",
    en: "Missing token in URL",
  },
  invalidToken: {
    ar: "رمز غير صالح",
    en: "Invalid token",
  },
  tokenExpired: {
    ar: "انتهت صلاحية رابط إعادة التعيين. يرجى طلب رابط جديد.",
    en: "Your reset link has expired. Please request a new one.",
  },
  errorProcessingResetLink: {
    ar: "حدث خطأ أثناء معالجة رابط إعادة التعيين",
    en: "Error processing reset link",
  },
  invalidOrExpiredToken: {
    ar: "رمز غير صالح أو منتهي الصلاحية",
    en: "Invalid or expired token",
  },
  goToForgotPassword: {
    ar: "انتقل إلى صفحة نسيت كلمة المرور",
    en: "Go to Forgot Password",
  },
  sessionExpired: {
    ar: "انتهت صلاحية الجلسة",
    en: "Session expired",
  },

  newPassword: {
    ar: "كلمة المرور الجديدة",
    en: "New Password",
  },
  confirmPassword: {
    ar: "تأكيد كلمة المرور",
    en: "Confirm Password",
  },
  updating: {
    ar: "جاري التحديث...",
    en: "Updating...",
  },
  updatePassword: {
    ar: "تحديث كلمة المرور",
    en: "Update Password",
  },
  pleaseEnterPassword: {
    ar: "يرجى إدخال كلمة المرور",
    en: "Please enter your password",
  },
  passwordsDoNotMatch: {
    ar: "كلمات المرور غير متطابقة",
    en: "Passwords do not match",
  },
  passwordTooShort: {
    ar: "كلمة المرور قصيرة جدًا، يجب أن تكون 6 أحرف على الأقل",
    en: "Password is too short, it must be at least 6 characters",
  },
  passwordUpdateError: {
    ar: "حدث خطأ أثناء تحديث كلمة المرور",
    en: "An error occurred updating your password",
  },
  passwordUpdatedSuccess: {
    ar: "تم تحديث كلمة المرور بنجاح",
    en: "Password updated successfully",
  },
  passwordUpdatedDescription: {
    ar: "تم تحديث كلمة المرور الخاصة بك بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.",
    en: "Your password has been updated successfully. You can now login with your new password.",
  },
  redirectingToLogin: {
    ar: "جاري إعادة التوجيه إلى صفحة تسجيل الدخول...",
    en: "Redirecting to login page...",
  },
  loginNow: {
    ar: "تسجيل الدخول الآن",
    en: "Login Now",
  },
  invalidResetLink: {
    ar: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية",
    en: "Invalid or expired reset link",
  },
  userNotFound: {
    ar: "البريد الإلكتروني غير مسجل في النظام",
    en: "Email address is not registered in the system",
  },

  // Security Questions
  securityQuestions: {
    ar: "الأسئلة الأمنية",
    en: "Security Questions",
  },
  setupSecurityQuestions: {
    ar: "إعداد الأسئلة الأمنية",
    en: "Setup Security Questions",
  },
  securityQuestionsDescription: {
    ar: "قم بإعداد أسئلة أمنية لمساعدتك في استعادة حسابك في حال نسيت كلمة المرور",
    en: "Set up security questions to help recover your account if you forget your password",
  },
  securityQuestion: {
    ar: "السؤال الأمني",
    en: "Security Question",
  },
  securityAnswer: {
    ar: "الإجابة الأمنية",
    en: "Security Answer",
  },
  securityQuestionPlaceholder: {
    ar: "اكتب سؤالاً أمنياً خاصاً بك",
    en: "Write your own security question",
  },
  securityAnswerPlaceholder: {
    ar: "اكتب الإجابة على السؤال الأمني",
    en: "Write the answer to your security question",
  },
  saving: {
    ar: "جاري الحفظ...",
    en: "Saving...",
  },
  saveSecurityQuestions: {
    ar: "حفظ الأسئلة الأمنية",
    en: "Save Security Questions",
  },
  updateSecurityQuestions: {
    ar: "تحديث الأسئلة الأمنية",
    en: "Update Security Questions",
  },
  securityQuestionsUpdated: {
    ar: "تم تحديث الأسئلة الأمنية بنجاح",
    en: "Security questions updated successfully",
  },
  securityQuestionsCreated: {
    ar: "تم إنشاء الأسئلة الأمنية بنجاح",
    en: "Security questions created successfully",
  },
  allFieldsRequired: {
    ar: "جميع الحقول مطلوبة",
    en: "All fields are required",
  },
  errorSavingSecurityQuestions: {
    ar: "حدث خطأ أثناء حفظ الأسئلة الأمنية",
    en: "Error saving security questions",
  },
  errorFetchingSecurityQuestions: {
    ar: "حدث خطأ أثناء جلب الأسئلة الأمنية",
    en: "Error fetching security questions",
  },
  securityQuestionsVerification: {
    ar: "يرجى الإجابة على الأسئلة الأمنية التالية للتحقق من هويتك",
    en: "Please answer the following security questions to verify your identity",
  },
  allAnswersRequired: {
    ar: "يرجى الإجابة على جميع الأسئلة",
    en: "Please answer all questions",
  },
  errorCheckingAnswers: {
    ar: "حدث خطأ أثناء التحقق من الإجابات",
    en: "Error checking answers",
  },
  incorrectAnswers: {
    ar: "الإجابات غير صحيحة. يرجى المحاولة مرة أخرى",
    en: "Incorrect answers. Please try again",
  },
  verifyAnswers: {
    ar: "التحقق من الإجابات",
    en: "Verify Answers",
  },
  verifying: {
    ar: "جاري التحقق...",
    en: "Verifying...",
  },
  checking: {
    ar: "جاري التحقق...",
    en: "Checking...",
  },
  continue: {
    ar: "متابعة",
    en: "Continue",
  },
  back: {
    ar: "رجوع",
    en: "Back",
  },
  errorProcessingRequest: {
    ar: "حدث خطأ أثناء معالجة الطلب",
    en: "Error processing request",
  },
  emailForRecovery: {
    ar: "البريد الإلكتروني لاستعادة الحساب",
    en: "Email for Recovery",
  },
  emailForRecoveryDescription: {
    ar: "هذا هو البريد الإلكتروني الذي سيتم استخدامه لاستعادة حسابك في حال نسيت كلمة المرور",
    en: "This is the email that will be used to recover your account if you forget your password",
  },
  importantNote: {
    ar: "ملاحظة هامة",
    en: "Important Note",
  },
  useThisEmailForRecovery: {
    ar: "استخدم هذا البريد الإلكتروني عند محاولة استعادة كلمة المرور، حيث سيتم استخدامه للتحقق من هويتك من خلال الأسئلة الأمنية",
    en: "Use this email when attempting to recover your password, as it will be used to verify your identity through security questions",
  },
};
