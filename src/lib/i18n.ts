import { LanguageKey } from './language-key';

export type Translations = {
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
    ar: "سجل الآن واستمتع بتجربة توصيل سريعة وآمنة للمقتنيات الثمينة",
    en: "Register now and enjoy a fast and secure delivery experience for your valuables"
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
    ar: "لوحة المعلومات",
    en: "Dashboard"
  },
  orders: {
    ar: "الطلبات",
    en: "Orders"
  },
  createOrder: {
    ar: "طلب جديد",
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
  ratings: {
    ar: "التقييمات",
    en: "Ratings"
  },
  earnings: {
    ar: "الأرباح",
    en: "Earnings"
  },
  notifications: {
    ar: "الإشعارات",
    en: "Notifications"
  },
  support: {
    ar: "الدعم والمساعدة",
    en: "Support & Help"
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
  },
  nationalId: {
    ar: "رقم الهوية",
    en: "National ID"
  },
  nationalIdPlaceholder: {
    ar: "أدخل رقم الهوية",
    en: "Enter your national ID"
  },
  licenseNumber: {
    ar: "رقم الرخصة",
    en: "License Number"
  },
  licenseNumberPlaceholder: {
    ar: "أدخل رقم الرخصة",
    en: "Enter your license number"
  },
  nationalIdDocument: {
    ar: "صورة الهوية",
    en: "National ID Document"
  },
  licenseDocument: {
    ar: "صورة الرخصة",
    en: "License Document"
  },
  vehicleMake: {
    ar: "نوع السيارة",
    en: "Vehicle Make"
  },
  vehicleMakePlaceholder: {
    ar: "أدخل نوع السيارة",
    en: "Enter vehicle make"
  },
  vehicleModel: {
    ar: "موديل السيارة",
    en: "Vehicle Model"
  },
  vehicleModelPlaceholder: {
    ar: "أدخل موديل السيارة",
    en: "Enter vehicle model"
  },
  vehicleYear: {
    ar: "سنة الصنع",
    en: "Vehicle Year"
  },
  vehicleYearPlaceholder: {
    ar: "أدخل سنة الصنع",
    en: "Enter vehicle year"
  },
  plateNumber: {
    ar: "رقم اللوحة",
    en: "Plate Number"
  },
  plateNumberPlaceholder: {
    ar: "أدخل رقم اللوحة",
    en: "Enter plate number"
  },
  driverRegistrationPendingDescription: {
    ar: "تم تقديم طلب التسجيل بنجاح. سيتم مراجعة طلبك من قبل الإدارة.",
    en: "Your registration has been submitted successfully. Your application will be reviewed by our team."
  },
  blacklistedMessage: {
    ar: "عذراً، لا يمكن إكمال التسجيل. يرجى التواصل مع خدمة العملاء.",
    en: "Sorry, registration cannot be completed. Please contact customer support."
  },
  registrationBlocked: {
    ar: "تم حظر التسجيل",
    en: "Registration Blocked"
  },
  adminLogin: {
    ar: "تسجيل دخول المشرف",
    en: "Admin Login"
  },
  adminDashboard: {
    ar: "لوحة تحكم المشرف",
    en: "Admin Dashboard"
  },
  customerDashboard: {
    ar: "لوحة تحكم العميل",
    en: "Customer Dashboard"
  },
  driverDashboard: {
    ar: "لوحة تحكم السائق",
    en: "Driver Dashboard"
  },
  overview: {
    ar: "نظرة عامة",
    en: "Overview"
  },
  activeOrders: {
    ar: "الطلبات النشطة",
    en: "Active Orders"
  },
  orderHistory: {
    ar: "سجل الطلبات",
    en: "Order History"
  },
  loginSuccess: {
    ar: "تم تسجيل الدخول بنجاح",
    en: "Login Successful"
  },
  loginFailed: {
    ar: "فشل تسجيل الدخول",
    en: "Login Failed"
  },
  status: {
    ar: "الحالة",
    en: "Status"
  },
  actions: {
    ar: "الإجراءات",
    en: "Actions"
  },
  viewDetails: {
    ar: "عرض التفاصيل",
    en: "View Details"
  },
  totalOrders: {
    ar: "إجمالي الطلبات",
    en: "Total Orders"
  },
  revenue: {
    ar: "الإيرادات",
    en: "Revenue"
  },
  availableOrders: {
    ar: "طلبات متاحة",
    en: "Available Orders"
  },
  currentOrders: {
    ar: "الطلبات الحالية",
    en: "Current Orders"
  },
  myVehicle: {
    ar: "مركبتي",
    en: "My Vehicle"
  },
  accept: {
    ar: "قبول",
    en: "Accept"
  },
  reject: {
    ar: "رفض",
    en: "Reject"
  },
  available: {
    ar: "متاح",
    en: "Available"
  },
  unavailable: {
    ar: "غير متاح",
    en: "Unavailable"
  },
  from: {
    ar: "من",
    en: "From"
  },
  to: {
    ar: "إلى",
    en: "To"
  },
  distance: {
    ar: "المسافة",
    en: "Distance"
  },
  amount: {
    ar: "المبلغ",
    en: "Amount"
  },
  order: {
    ar: "الطلب",
    en: "Order"
  },
  date: {
    ar: "التاريخ",
    en: "Date"
  },
  rating: {
    ar: "التقييم",
    en: "Rating"
  },
  ctaTitle: {
    ar: "ابدأ الآن في استخدام خدمات سيف دروب لتوصيل شحناتك بكل أمان",
    en: "Start using SafeDrop services now to deliver your shipments safely"
  },
  ctaDescription: {
    ar: " سجل الآن واستمتع بتجربة توصيل سريعة وآمنة للمقتنيات الثمينة",
    en: "Register now and enjoy a fast and secure delivery experience"
  },
  heroTitle: {
    ar: "توصيل سريع وآمن للمقتنيات الثمينة",
    en: "Fast and secure delivery for valuable items"
  },
  footerDescription: {
    ar: "توصيل آمن وأمن ومحمي للأشياء الثمينة",
    en: "Secure and protected delivery for valuable items"
  },
  parcelDelivery: {
    ar: "توصيل الطرود",
    en: "Parcel Delivery"
  },
  transactionProtection: {
    ar: "حماية المعاملات",
    en: "Transaction Protection"
  },
  shipmentTracking: {
    ar: "تتبع الشحنات",
    en: "Shipment Tracking"
  },
  expressDelivery: {
    ar: "التوصيل السريع",
    en: "Express Delivery"
  },
  termsAndConditions: {
    ar: "الشروط والأحكام",
    en: "Terms & Conditions"
  },
  location: {
    ar: "المملكة العربية السعودية، الرياض",
    en: "Saudi Arabia"
  },
  notificationSettings: {
    ar: "إعدادات الإشعارات",
    en: "Notification Settings"
  },
  orderNotifications: {
    ar: "إشعارات الطلبات",
    en: "Order Notifications"
  },
  messageNotifications: {
    ar: "إشعارات الرسائل",
    en: "Message Notifications"
  },
  earningsNotifications: {
    ar: "إشعارات الأرباح",
    en: "Earnings Notifications"
  },
  systemNotifications: {
    ar: "إشعارات التحديثات",
    en: "System Updates"
  },
  receiveOrderNotifications: {
    ar: "استلام إشعارات عن الطلبات الجديدة",
    en: "Receive notifications about new orders"
  },
  receiveMessageNotifications: {
    ar: "استلام إشعارات عن الرسائل الجديدة",
    en: "Receive notifications about new messages"
  },
  receiveEarningsNotifications: {
    ar: "استلام إشعارات عن الأرباح والمدفوعات",
    en: "Receive notifications about earnings and payments"
  },
  receiveUpdateNotifications: {
    ar: "استلام إشعارات عن تحديثات النظام",
    en: "Receive notifications about system updates"
  },
  languageSettings: {
    ar: "إعدادات اللغة",
    en: "Language Settings"
  },
  preferredLanguage: {
    ar: "اللغة المفضلة",
    en: "Preferred Language"
  },
  securitySettings: {
    ar: "الأمان والخصوصية",
    en: "Security & Privacy"
  },
  changePassword: {
    ar: "تغيير كلمة المرور",
    en: "Change Password"
  },
  twoFactorAuth: {
    ar: "تفعيل التحقق بخطوتين",
    en: "Enable Two-Factor Authentication"
  },
  connectedDevices: {
    ar: "إدارة الأجهزة المتصلة",
    en: "Manage Connected Devices"
  },
  darkMode: {
    ar: "الوضع الليلي",
    en: "Dark Mode"
  },
  enableDarkMode: {
    ar: "تفعيل المظهر الداكن للتطبيق",
    en: "Enable dark mode for the application"
  },
  saveChanges: {
    ar: "حفظ التغييرات",
    en: "Save Changes"
  },
  verifiedDrivers: {
    ar: "سائقون معتمدون",
    en: "Verified Drivers"
  },
  verifiedDriversDescription: {
    ar: "كل السائين في منصتنا مرون بعملية تحقق شاملة من بياناتهم ورخصهم قبل قبولهم. نضمن لك التعامل مع أشخاص موثوقين وذوي كفاءة عالية.",
    en: "All drivers on our platform undergo a comprehensive verification process of their credentials and licenses before acceptance. We ensure you deal with reliable and highly competent individuals."
  },
  licenseVerification: {
    ar: "تحقق من الرخصة والهوية",
    en: "License and ID verification"
  },
  publicRatings: {
    ar: "تقييمات علنية من العملاء",
    en: "Public ratings from customers"
  },
  professionalService: {
    ar: "خدمة احترافية وآمنة",
    en: "Professional and secure service"
  },
  servicesHeroTitle: {
    ar: "خدماتنا",
    en: "Our Services"
  },
  servicesHeroDescription: {
    ar: "نقدم مجموعة من الخدمات المتكاملة للوصول لتوصيل سريع وآمن للمقتنيات الثمينة",
    en: "We provide a comprehensive range of integrated services for fast and secure delivery of valuable items"
  },
  registerAsCustomer: {
    ar: "تسجيل كعميل",
    en: "Register as Customer"
  },
  registerAsDriver: {
    ar: "تسجيل كسائق",
    en: "Register as Driver"
  },
  parcelDeliveryDescription: {
    ar: "نقدّم خدمة توصيل الطرود بكل أمان وسرعة إلى باب العميل، مع تحديثات مستمرة، لضمان أن تصل شحنتك بحالة ممتازة وفي الوقت الذي تريده تمامًا.",
    en: "We provide a secure and fast parcel delivery service to your doorstep, with continuous updates, ensuring your shipment arrives in excellent condition exactly when you want it."
  },
  allAreas: {
    ar: "التوصيل إلى جميع المناطق في السعودية",
    en: "Delivery to all areas in Saudi Arabia"
  },
  securePacking: {
    ar: "تغليف آمن ومحكم",
    en: "Secure and tight packaging"
  },
  directDelivery: {
    ar: "تسليم مباشر للمستلم",
    en: "Direct delivery to recipient"
  },
  transactionProtectionDescription: {
    ar: "نؤمن تعاملاتك من خلال نظام ضمان مالي (Escrow) يحفظ أموالك حتى يتم تأكيد استلام الطرد، مما يوفّر تجربة موثوقة وعادلة للطرفين ويمنع أي محاولة احتيال أو تلاعب.",
    en: "We secure your transactions through an Escrow system that protects your money until package delivery is confirmed, providing a reliable and fair experience for both parties and preventing any fraud attempts."
  },
  fraudProtection: {
    ar: "حماية من الاحتيال",
    en: "Fraud Protection"
  },
  paymentConfirmation: {
    ar: "تأكيد قبل تحرير الدفع",
    en: "Confirmation before payment release"
  },
  trustedSystem: {
    ar: "نظام موثوق ومعتمد",
    en: "Trusted and certified system"
  },
  expressDeliveryDescription: {
    ar: "نوفّر لك خدمة توصيل سريعة وفعالة في نفس اليوم أو خلال ساعات، لتلبية احتياجاتك الطارئة بسهولة واحترافية مع أولوية كاملة في التنفيذ والتوصيل.",
    en: "We provide you with fast and efficient same-day or within-hours delivery service, meeting your urgent needs easily and professionally with full priority in execution and delivery."
  },
  sameDayDelivery: {
    ar: "تسليم بنفس اليوم",
    en: "Same-day delivery"
  },
  executionPriority: {
    ar: "أولوية في التنفيذ",
    en: "Priority in execution"
  },
  suitableForUrgentOrders: {
    ar: "مناسب للطلبات المستعجلة",
    en: "Suitable for urgent orders"
  },
  startWithSafedrop: {
    ar: "ابدأ رحلتك مع سيف دروب الوم",
    en: "Start your journey with SafeDrop today"
  },
  safeDeliveryExperience: {
    ar: "سجل الآن واستمتع بتجربة توصيل آمنة ومضمونة لطرودك الثمينة",
    en: "Register now and enjoy a safe and guaranteed delivery experience for your valuable packages"
  },
  aboutHero: {
    ar: "من نحن",
    en: "About Us"
  },
  aboutDescription: {
    ar: "سيف دروب هي منصة متخصصة في توفير خدمات توصيل سريع وآمن للمقتنيات الثمينة",
    en: "SafeDrop is a specialized platform providing fast and secure delivery services for valuable items"
  },
  ourStory: {
    ar: "قصتنا",
    en: "Our Story"
  },
  ourStoryDescription1: {
    ar: "جاءت فكرتنا من حاجة حقيقية لنظام توصيل يحمي الممتلكات الشخصية ويوفر للناس راحة البال. أردنا تقديم تجربة مختلفة وأكثر أمانًا وشفافية من الطرق التقليدية.",
    en: "Our idea came from a real need for a delivery system that protects personal property and provides people with peace of mind. We wanted to offer a different experience, more secure and transparent than traditional methods."
  },
  ourStoryDescription2: {
    ar: "أنشأنا SafeDrop لنكون حلًا موثوقًا لكل من يحتاج إلى توصيل آمن وسهل. اعتمدنا على البساطة، الوضوح، ونظام حماية مالي لضمان حقوق الجميع.",
    en: "We created SafeDrop to be a reliable solution for anyone who needs secure and easy delivery. We relied on simplicity, clarity, and a financial protection system to ensure everyone's rights."
  },
  ourValues: {
    ar: "قيمنا",
    en: "Our Values"
  },
  ourValuesDescription: {
    ar: "المبادئ التي نعمل بها كل يوم",
    en: "The principles we work with every day"
  },
  security: {
    ar: "الأمان",
    en: "Security"
  },
  securityDescription: {
    ar: "نضع أمان العملاء والمنتجات في مقدمة أولوياتنا ونتخذ كافة الإجراءات لضمان حماية كاملة.",
    en: "We put customer and product safety at the forefront of our priorities. We take all measures to ensure complete protection."
  },
  quality: {
    ar: "الجودة",
    en: "Quality"
  },
  qualityDescription: {
    ar: "نلتزم بتقديم خدمة عالية الجودة في كل تفاصيلها، من اختيار السائقين إلى تسليم الشحنات.",
    en: "We are committed to providing high-quality service in all its details, from selecting drivers to delivering shipments."
  },
  transparency: {
    ar: "الشفافية",
    en: "Transparency"
  },
  transparencyDescription: {
    ar: "نؤمن بالشفافية التامة في تعاملاتنا ونوفر متابعة مستمرة ومعلومات واضحة في كل مرحلة.",
    en: "We believe in complete transparency in our dealings. We provide continuous monitoring and clear information at every stage."
  },
  innovation: {
    ar: "الابتكار",
    en: "Innovation"
  },
  innovationDescription: {
    ar: "نسعى دائمًا لتطوير خدماتنا وتقديم حلول مبتكرة تلبي احتياجات عملائنا المتنوعة.",
    en: "We always strive to develop our services and provide innovative solutions that meet the diverse needs of our customers."
  },
  sendMessage: {
    ar: "أرسل لنا رسالة",
    en: "Send us a message"
  },
  fullName: {
    ar: "الاسم الكامل",
    en: "Full Name"
  },
  messageSubject: {
    ar: "موضوع الرسالة",
    en: "Message Subject"
  },
  messageContent: {
    ar: "الرسالة",
    en: "Message"
  },
  messageSent: {
    ar: "تم إرسال رسالتك نجاح",
    en: "Your message has been sent successfully"
  },
  messageWillReply: {
    ar: "سنتواصل معك في أقرب وقت ممكن",
    en: "We will contact you as soon as possible"
  },
  sending: {
    ar: "جاري الإرسال...",
    en: "Sending..."
  },
  workingHours: {
    ar: "ساعات العمل",
    en: "Working Hours"
  },
  workingDays: {
    ar: "الأحد - السبت : 9:00 ص - 9:00 م",
    en: "Sunday - Saturday: 9:00 AM - 9:00 PM"
  },
  loading: {
    ar: "جاري التحميل...",
    en: "Loading..."
  },
  systemError: {
    ar: "خطأ في النظام",
    en: "System Error"
  },
  errorLoadingAccount: {
    ar: "حدث خطأ عند جلب بيانات الحساب",
    en: "Error loading account data"
  },
  refreshPage: {
    ar: "تحديث الصفحة",
    en: "Refresh Page"
  },
  accountRejected: {
    ar: "تم رفض طلبك",
    en: "Your application was rejected"
  },
  accountRejectedDesc: {
    ar: "للأسف، تم رفض طلب انضمامك كسائق في منصة سيف دروب",
    en: "Unfortunately, your application to join SafeDrop as a driver has been rejected"
  },
  rejectionReason: {
    ar: "سبب الرفض:",
    en: "Rejection reason:"
  },
  reapplyNote: {
    ar: "يمكنك تعديل بياناتك وإعادة التقديم مرة واحدة",
    en: "You can modify your information and reapply once"
  },
  reapply: {
    ar: "إعادة التقديم",
    en: "Reapply"
  },
  accountFrozen: {
    ar: "الحساب مجمد مؤقتاً",
    en: "Account temporarily frozen"
  },
  accountFrozenDesc: {
    ar: "تم رفض طلبك كسائق مرتين متتاليتين. يرجى التواصل مع الدعم الفني لتقديم اعتراض أو استفسار",
    en: "Your driver application has been rejected twice in a row. Please contact support to file an appeal or inquiry"
  },
  supportTitle: {
    ar: "الدعم والمساعدة",
    en: "Support & Help"
  },
  callUs: {
    ar: "اتصل بنا",
    en: "Call Us"
  },
  emailSupport: {
    ar: "البريد الإلكتروني",
    en: "Email Support"
  },
  faqTitle: {
    ar: "الأسئلة الشائعة",
    en: "Frequently Asked Questions"
  },
  updateVehicleInfo: {
    ar: "كيف يمكنني تحديث معلومات مركبتي؟",
    en: "How can I update my vehicle information?"
  },
  updateVehicleAnswer: {
    ar: "يمكنك تحديث معلومات مركبتك من خلال الذهاب إلى صفحة 'مركبتي' في لوحة التحكم.",
    en: "You can update your vehicle information by going to the 'My Vehicle' page in your dashboard."
  },
  earningsTransfer: {
    ar: "متى يتم تحويل الأرباح؟",
    en: "When are earnings transferred?"
  },
  earningsTransferAnswer: {
    ar: "يتم تحويل الأرباح بشكل أسبوعي كل يوم خميس.",
    en: "Earnings are transferred weekly every Thursday."
  },
  reportIssueQuestion: {
    ar: "كيف يمكنني الإبلاغ عن مشكلة في طلب؟",
    en: "How can I report an issue with an order?"
  },
  reportIssueAnswer: {
    ar: "يمكنك الإبلاغ عن المشكلة من خلال الضغط على زر 'الإبلاغ' في تفاصيل الطلب.",
    en: "You can report an issue by clicking the 'Report' button in the order details."
  },
  withdrawEarningsQuestion: {
    ar: "كيف أسحب أرباحي؟",
    en: "How can I withdraw my earnings?"
  },
  withdrawEarningsAnswer: {
    ar: "يمكنك سحب أرباحك عبر إعدادات الحساب وإدخال بياناتك البنكية.",
    en: "You can withdraw your earnings through account settings by entering your bank details."
  },
  updateOrderStatusQuestion: {
    ar: "كيف يمكنني تحديث حالت أمام العميل؟",
    en: "How can I update my status for the customer?"
  },
  updateOrderStatusAnswer: {
    ar: "عند تحديث حالة الطلب (مثل \"جار التوصيل\" أو \"تم التوصيل\") من خلال التطبيق، يتم إشعار العميل بحالة الشحنة",
    en: "When updating the order status (such as 'In Delivery' or 'Delivered') through the app, the customer is notified of the shipment status."
  },
  troubleshootingQuestion: {
    ar: "ماذا أفعل عند مواجهة مشكلة؟",
    en: "What should I do when encountering a problem?"
  },
  troubleshootingAnswer: {
    ar: "تواصل مع فريق الدعم عبر البريد الإلكتروني أو صفحة \"اتصل بنا\".",
    en: "Contact our support team via email or through the 'Contact Us' page."
  },
  contactPhone: {
    ar: "+966 55 616 0601",
    en: "+966 55 616 0601"
  },
  contactEmail: {
    ar: "support@safedropksa.com",
    en: "support@safedropksa.com"
  },
  manageOrders: {
    ar: "إدارة الطلبات",
    en: "Manage Orders"
  },
  availableForOrders: {
    ar: "متاح",
    en: "Available"
  },
  notAvailableForOrders: {
    ar: "غير متاح",
    en: "Not Available"
  },
  currentOrdersTab: {
    ar: "الطلبات الحالية",
    en: "Current Orders"
  },
  availableOrdersTab: {
    ar: "طلبات متاحة",
    en: "Available Orders"
  },
  completedOrdersTab: {
    ar: "مكتملة",
    en: "Completed"
  },
  noCurrentOrders: {
    ar: "لا توجد طلبات حالية",
    en: "No current orders"
  },
  browseAvailableOrders: {
    ar: "استعرض الطلبات المتاحة",
    en: "Browse Available Orders"
  },
  notAvailableMessage: {
    ar: "أنت حالياً غير متاح لاستقبال طلبات جديدة",
    en: "You are currently not available to receive new orders"
  },
  changeToAvailable: {
    ar: "تغيير الحالة إلى متاح",
    en: "Change Status to Available"
  },
  noAvailableOrders: {
    ar: "لا توجد طلبات متاحة حالياً",
    en: "No orders available at the moment"
  },
  noCompletedOrders: {
    ar: "لا توجد طلبات مكتملة",
    en: "No completed orders"
  },
  personalInformation: {
    ar: "البيانات الشخصية",
    en: "Personal Information"
  },
  documents: {
    ar: "الوثائق والمستندات",
    en: "Documents"
  },
  documentStatus: {
    ar: "حالة الوثائق",
    en: "Document Status"
  },
  profileTitle: {
    ar: "الملف الشخصي",
    en: "Profile"
  },
  address: {
    ar: "العنوان",
    en: "Address"
  },
  savingChanges: {
    ar: "جاري الحفظ...",
    en: "Saving..."
  },
  uploadingDocuments: {
    ar: "جاري رفع الوثائق...",
    en: "Uploading Documents..."
  },
  uploadDocuments: {
    ar: "رفع الوثائق",
    en: "Upload Documents"
  },
  nationalIdExpiry: {
    ar: "تاريخ انتهاء الهوية",
    en: "National ID Expiry Date"
  },
  licenseExpiry: {
    ar: "تاريخ انتهاء الرخصة",
    en: "License Expiry Date"
  },
  passwordChangedSuccessfully: {
    ar: "تم تغيير كلمة المرور بنجاح",
    en: "Password changed successfully"
  },
  documentsUploadedSuccessfully: {
    ar: "تم رفع الوثائق بنجاح، وسيتم مراجعتها",
    en: "Documents uploaded successfully and will be reviewed"
  },
  profileUpdatedSuccessfully: {
    ar: "تم تحديث البيانات الشخصية بنجاح",
    en: "Personal information updated successfully"
  },
  errorLoadingProfile: {
    ar: "حدث خطأ أثناء تحميل البيانات",
    en: "Error loading profile data"
  },
  errorUpdatingProfile: {
    ar: "حدث خطأ أثناء تحديث البينات",
    en: "Error updating profile data"
  },
  earningsTitle: {
    ar: "الأرباح",
    en: "Earnings"
  },
  todayEarnings: {
    ar: "الأرباح اليوم",
    en: "Today's Earnings"
  },
  weeklyEarnings: {
    ar: "الأرباح هذا الأسبوع",
    en: "This Week's Earnings"
  },
  monthlyEarnings: {
    ar: "الأرباح هذا الشهر",
    en: "This Month's Earnings"
  },
  earningsAnalysis: {
    ar: "تحليل الأرباح",
    en: "Earnings Analysis"
  },
  markAllAsRead: {
    ar: "تحديد الكل كمقروء",
    en: "Mark All as Read"
  },
  allNotificationsMarkedAsRead: {
    ar: "تم تحديد جميع الإشعارات كمقروءة",
    en: "All notifications marked as read"
  },
  errorUpdatingNotifications: {
    ar: "حدث خطأ أثناء تحديث الإشعارات",
    en: "Error updating notifications"
  },
  ratingsTitle: {
    ar: "التقييمات",
    en: "Ratings"
  },
  stars: {
    ar: "نجوم",
    en: "stars"
  },
  loadingRatings: {
    ar: "جاري تحميل التقييمات...",
    en: "Loading ratings..."
  },
  errorLoadingRatings: {
    ar: "حدث خطأ أثناء تحميل التقييمات",
    en: "Error loading ratings"
  },
  latestRatings: {
    ar: "آخر التقييمات",
    en: "Latest Ratings"
  },
  notificationsTitle: {
    ar: "الإشعارات",
    en: "Notifications"
  },
  newOrder: {
    ar: "طلب جديد",
    en: "New Order"
  },
  pickupInfo: {
    ar: "معلومات الاستلام",
    en: "Pickup Information"
  },
  deliveryInfo: {
    ar: "معلومات التوصيل",
    en: "Delivery Information"
  },
  pickupAddress: {
    ar: "عنوان الاستلام",
    en: "Pickup Address"
  },
  deliveryAddress: {
    ar: "عنوان التوصيل",
    en: "Delivery Address"
  },
  additionalDetails: {
    ar: "تفاصيل إضافية",
    en: "Additional Details"
  },
  shipmentDetails: {
    ar: "تفاصيل الشحنة",
    en: "Shipment Details"
  },
  price: {
    ar: "السعر
