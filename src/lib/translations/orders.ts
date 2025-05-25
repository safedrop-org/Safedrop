import { TranslationSection } from "./types";

export const orders: TranslationSection = {
  // Orders Page
  "Active Orders": {
    ar: "الطلبات النشطة",
    en: "Active Orders",
  },
  "Order History": {
    ar: "سجل الطلبات",
    en: "Order History",
  },
  "Order ID": {
    ar: "رقم الطلب",
    en: "Order ID",
  },
  "Order Code": {
    ar: "كود الطلب",
    en: "Order Code",
  },
  orderDate: {
    ar: "تاريخ الطلب",
    en: "Order Date",
  },
  from: {
    ar: "من",
    en: "From",
  },
  to: {
    ar: "إلى",
    en: "To",
  },
  Driver: {
    ar: "السائق",
    en: "Driver",
  },
  Status: {
    ar: "الحالة",
    en: "Status",
  },
  Actions: {
    ar: "الإجراءات",
    en: "Actions",
  },
  "Order Received": {
    ar: "تم الاستلام",
    en: "Order Received",
  },
  available: {
    ar: "متاح",
    en: "Available",
  },
  pickedUp: {
    ar: "تم الاستلام",
    en: "Picked Up",
  },
  inTransit: {
    ar: "في الطريق",
    en: "In Transit",
  },
  approaching: {
    ar: "يقترب",
    en: "Approaching",
  },
  completed: {
    ar: "مكتمل",
    en: "Completed",
  },
  cancelled: {
    ar: "ملغي",
    en: "Cancelled",
  },
  noCurrentOrders: {
    ar: "لا توجد طلبات حالية",
    en: "No current orders",
  },

  // Customer Orders additional translations
  order: {
    ar: "طلب",
    en: "Order",
  },

  // Create Order Page
  createOrder: {
    ar: "إنشاء طلب",
    en: "Create Order",
  },
  pickupInfo: {
    ar: "معلومات الاستلام",
    en: "Pickup Information",
  },
  pickupAddress: {
    ar: "عنوان الاستلام",
    en: "Pickup Address",
  },
  enterPickupAddress: {
    ar: "أدخل عنوان الاستلام",
    en: "Enter pickup address",
  },
  additionalDetails: {
    ar: "تفاصيل إضافية",
    en: "Additional Details",
  },
  buildingNumFloor: {
    ar: "رقم المبنى/الطابق",
    en: "Building number/Floor",
  },
  deliveryInfo: {
    ar: "معلومات التوصيل",
    en: "Delivery Information",
  },
  deliveryAddress: {
    ar: "عنوان التوصيل",
    en: "Delivery Address",
  },
  enterDeliveryAddress: {
    ar: "أدخل عنوان التوصيل",
    en: "Enter delivery address",
  },
  shipmentDetails: {
    ar: "تفاصيل الشحنة",
    en: "Shipment Details",
  },
  price: {
    ar: "السعر",
    en: "Price",
  },
  driverCommission: {
    ar: "عمولة المنصة 20%",
    en: "Platform commission 20%",
  },
  packageDescription: {
    ar: "وصف الطرد",
    en: "Package Description",
  },
  contentsSizeWeight: {
    ar: "المحتويات/الحجم/الوزن",
    en: "Contents/Size/Weight",
  },
  driverNotes: {
    ar: "ملاحظات للسائق",
    en: "Notes for Driver",
  },
  specialInstructions: {
    ar: "تعليمات خاصة",
    en: "Special instructions",
  },
  cancel: {
    ar: "إلغاء",
    en: "Cancel",
  },
  sending: {
    ar: "جاري الإرسال",
    en: "Sending",
  },
  submitOrder: {
    ar: "إرسال الطلب",
    en: "Submit Order",
  },
  errorCheckingDriverStatus: {
    ar: "خطأ في التحقق من حالة السائق",
    en: "Error checking driver status",
  },
  driverNotApproved: {
    ar: "يجب الموافقة على حسابك من قبل الإدارة أولاً",
    en: "Your account must be approved by admin first",
  },
  errorUpdatingAvailability: {
    ar: "خطأ في تحديث حالة التوفر",
    en: "Error updating availability",
  },
  nowAvailableForOrders: {
    ar: "أنت متاح الآن لاستلام الطلبات",
    en: "You are now available for orders",
  },
  nowNotAvailableForOrders: {
    ar: "أنت غير متاح لاستلام الطلبات",
    en: "You are not available for orders",
  },
  updating: {
    ar: "جاري التحديث...",
    en: "Updating...",
  },

  // Loading and error states
  loadingOrders: {
    ar: "جاري تحميل الطلبات...",
    en: "Loading orders...",
  },
  errorLoadingOrders: {
    ar: "خطأ في تحميل الطلبات",
    en: "Error loading orders",
  },
  tryAgain: {
    ar: "حاول مرة أخرى",
    en: "Try Again",
  },
  refreshOrders: {
    ar: "تحديث الطلبات",
    en: "Refresh Orders",
  },

  // Order management messages
  mustLoginToAcceptOrder: {
    ar: "يجب تسجيل الدخول لقبول الطلب",
    en: "Must login to accept order",
  },
  errorCheckingOrderStatus: {
    ar: "حدث خطأ أثناء التحقق من حالة الطلب",
    en: "Error checking order status",
  },
  orderNotFound: {
    ar: "لم يتم العثور على الطلب",
    en: "Order not found",
  },
  orderNoLongerAvailable: {
    ar: "هذا الطلب لم يعد متاحاً للقبول",
    en: "This order is no longer available",
  },
  errorAcceptingOrder: {
    ar: "حدث خطأ أثناء قبول الطلب",
    en: "Error accepting order",
  },
  errorAcceptingOrderNoData: {
    ar: "حدث خطأ أثناء قبول الطلب - لم يتم العثور على الطلب",
    en: "Error accepting order - order not found",
  },
  orderAcceptedSuccessfully: {
    ar: "تم قبول الطلب بنجاح",
    en: "Order accepted successfully",
  },

  // Driver management interface
  manageOrders: {
    ar: "إدارة الطلبات",
    en: "Manage Orders",
  },
  availabilityStatus: {
    ar: "حالة التوفر",
    en: "Availability Status",
  },
  availableForOrders: {
    ar: "متاح للطلبات",
    en: "Available for Orders",
  },
  notAvailableForOrders: {
    ar: "غير متاح للطلبات",
    en: "Not Available for Orders",
  },
  currentOrdersTab: {
    ar: "الطلبات الحالية",
    en: "Current Orders",
  },
  availableOrdersTab: {
    ar: "الطلبات المتاحة",
    en: "Available Orders",
  },
  completedOrdersTab: {
    ar: "الطلبات المكتملة",
    en: "Completed Orders",
  },
  currentOrdersTabShort: {
    ar: "الحالية",
    en: "Current",
  },
  availableOrdersTabShort: {
    ar: "متاحة",
    en: "Available",
  },
  completedOrdersTabShort: {
    ar: "مكتملة",
    en: "Completed",
  },
  browseAvailableOrders: {
    ar: "تصفح الطلبات المتاحة",
    en: "Browse Available Orders",
  },
  notAvailableMessage: {
    ar: "أنت غير متاح حالياً للطلبات الجديدة",
    en: "You are currently not available for new orders",
  },
  changeToAvailable: {
    ar: "تحويل إلى متاح",
    en: "Change to Available",
  },
  noAvailableOrders: {
    ar: "لا توجد طلبات متاحة",
    en: "No Available Orders",
  },

  // Location-related translations (MISSING KEYS)
  locationNotSupported: {
    ar: "الموقع الجغرافي غير مدعوم في هذا المتصفح",
    en: "Geolocation is not supported in this browser",
  },
  locationEnabledSuccessfully: {
    ar: "تم تفعيل الموقع الجغرافي بنجاح",
    en: "Location enabled successfully",
  },
  locationRequestFailed: {
    ar: "فشل في الحصول على الموقع الجغرافي",
    en: "Failed to get location",
  },
  locationPermissionDenied: {
    ar: "تم رفض الإذن للوصول للموقع الجغرافي",
    en: "Location permission denied",
  },
  locationUnavailable: {
    ar: "الموقع الجغرافي غير متاح",
    en: "Location unavailable",
  },
  locationTimeout: {
    ar: "انتهت مهلة الحصول على الموقع الجغرافي",
    en: "Location request timeout",
  },
  locationError: {
    ar: "خطأ في الموقع الجغرافي",
    en: "Location error",
  },
  enableLocation: {
    ar: "تفعيل الموقع",
    en: "Enable Location",
  },
  locationActive: {
    ar: "الموقع مفعل",
    en: "Location Active",
  },
  locationInactive: {
    ar: "الموقع غير مفعل",
    en: "Location Inactive",
  },
  locating: {
    ar: "جاري التحديد...",
    en: "Locating...",
  },
  locationBlocked: {
    ar: "الموقع محظور",
    en: "Location Blocked",
  },
  allowLocation: {
    ar: "السماح بالموقع",
    en: "Allow Location",
  },
  requesting: {
    ar: "جاري الطلب...",
    en: "Requesting...",
  },

  // Error dialog translations (MISSING KEYS)
  retry: {
    ar: "إعادة المحاولة",
    en: "Retry",
  },
  refreshPage: {
    ar: "تحديث الصفحة",
    en: "Refresh Page",
  },
  howToEnableLocation: {
    ar: "كيفية تفعيل الموقع:",
    en: "How to enable location:",
  },
  clickLockIcon: {
    ar: "اضغط على أيقونة القفل 🔒 في شريط العنوان",
    en: "Click the lock icon 🔒 in the address bar",
  },
  chooseAllowLocation: {
    ar: "اختر 'السماح' للموقع الجغرافي",
    en: "Choose 'Allow' for location access",
  },

  // Order Details Card
  orderId: {
    ar: "طلب #",
    en: "Order #",
  },
  customerInfo: {
    ar: "معلومات العميل:",
    en: "Customer Information:",
  },
  unknown: {
    ar: "غير معروف",
    en: "Unknown",
  },
  orderTime: {
    ar: "وقت الطلب:",
    en: "Order Time:",
  },
  pickupPoint: {
    ar: "نقطة الانطلاق:",
    en: "Pickup Point:",
  },
  dropoffPoint: {
    ar: "نقطة الوصول:",
    en: "Dropoff Point:",
  },
  notSpecified: {
    ar: "غير محدد",
    en: "Not Specified",
  },
  distance: {
    ar: "المسافة",
    en: "Distance",
  },
  estimatedTime: {
    ar: "الوقت المتوقع",
    en: "Estimated Time",
  },
  amount: {
    ar: "المبلغ",
    en: "Amount",
  },
  packageDetails: {
    ar: "تفاصيل الشحنة:",
    en: "Package Details:",
  },
  notes: {
    ar: "ملاحظات:",
    en: "Notes:",
  },
  currency: {
    ar: "ر.س",
    en: "SAR",
  },
  contactCustomer: {
    ar: "اتصال بالعميل",
    en: "Contact Customer",
  },
  pickupOrder: {
    ar: "التقاط الطلب",
    en: "Accept Order",
  },
  pickingUp: {
    ar: "جاري الالتقاط...",
    en: "Accepting...",
  },
  updateOrderStatus: {
    ar: "تحديث حالة الطلب:",
    en: "Update Order Status:",
  },
  waitingForCustomer: {
    ar: "بانتظار تأكيد العميل للإستلام",
    en: "Waiting for customer confirmation",
  },
  orderCompleteMessage: {
    ar: "سيتم إكمال الطلب عندما يقوم العميل بتأكيد الإستلام",
    en: "The order will be completed when the customer confirms receipt",
  },
  phoneNotAvailable: {
    ar: "رقم الهاتف غير متاح",
    en: "Phone number not available",
  },
  orderDelivered: {
    ar: "تم تسليم الطلب بنجاح",
    en: "Order delivered successfully",
  },
  errorUpdatingOrder: {
    ar: "حدث خطأ أثناء تحديث حالة الطلب",
    en: "Error updating order status",
  },
  orderNotFoundError: {
    ar: "حدث خطأ أثناء تحديث حالة الطلب - لم يتم العثور على الطلب أو ليس لديك صلاحية",
    en: "Error updating order status - Order not found or you don't have permission",
  },
  cantModifyOrder: {
    ar: "لا يمكنك تعديل طلب غير مسند إليك",
    en: "You cannot modify an order not assigned to you",
  },
  noCompletedOrders: {
    ar: "لا يوجد طلبات مكتملة",
    en: "No completed orders",
  },

  // Order Statuses (for component use)
  "status.available": {
    ar: "متاح",
    en: "Available",
  },
  "status.picked_up": {
    ar: "ملتقط",
    en: "Picked Up",
  },
  "status.in_transit": {
    ar: "تم إستلام الشحنة وجاري توصيلها",
    en: "In Transit",
  },
  "status.approaching": {
    ar: "اقترب",
    en: "Approaching",
  },
  "status.completed": {
    ar: "مكتمل",
    en: "Completed",
  },
  "status.cancelled": {
    ar: "ملغي",
    en: "Cancelled",
  },
  "status.no_location": {
    ar: "لا يمكن تحديث الحالة بدون تحديد الموقع",
    en: "Cannot update status without location",
  },
  "status.invalid_order_id": {
    ar: "معرف الطلب غير صالح",
    en: "Invalid order ID",
  },
  "status.login_required": {
    ar: "يجب تسجيل الدخول لتحديث حالة الطلب",
    en: "Login required to update order status",
  },
  "status.unauthorized_order": {
    ar: "لا يمكنك تعديل طلب غير مسند إليك",
    en: "You cannot modify an order not assigned to you",
  },
  "status.order_update_failed": {
    ar: "فشل تحديث حالة الطلب",
    en: "Order update failed",
  },
  "status.order_updated": {
    ar: "تم تحديث حالة الطلب",
    en: "Order updated",
  },
  "status.order_completed": {
    ar: "تم إكمال الطلب",
    en: "Order completed",
  },
  "status.order_cancelled": {
    ar: "تم إلغاء الطلب",
    en: "Order cancelled",
  },
  "status.location_required": {
    ar: "يجب تحديد الموقع لتحديث حالة الطلب",
    en: "Location required to update order status",
  },
  "status.location_disabled": {
    ar: "الموقع معطل",
    en: "Location disabled",
  },
  "status.location_enabled": {
    ar: "الموقع مفعل",
    en: "Location enabled",
  },
  "status.location_unavailable": {
    ar: "الموقع غير متاح",
    en: "Location unavailable",
  },
  "status.location_timeout": {
    ar: "انتهت مهلة الحصول على الموقع الجغرافي",
    en: "Location timeout",
  },
  "status.location_error": {
    ar: "خطأ في الموقع الجغرافي",
    en: "Location error",
  },
};
