# Driver Common Components

مجموعة من المكونات المشتركة لصفحات السائق في تطبيق Safedrop. تم إنشاء هذه المكونات لتقليل التكرار وتحسين صيانة الكود.

## الثوابت (Constants)

### SUPPORT_CONTACTS
معلومات الاتصال بالدعم الفني:

```typescript
export const SUPPORT_CONTACTS = {
  PHONE: {
    RAW: "+966556160601",        // للاستخدام في روابط tel:
    FORMATTED: "+966 55 616 0601", // للعرض
  },
  EMAIL: "support@safedropksa.com",
} as const;
```

### EMAIL_TEMPLATES
قوالب البريد الإلكتروني المحددة مسبقاً:

```typescript
export const EMAIL_TEMPLATES = {
  SUPPORT_REQUEST: {
    SUBJECT: "طلب دعم فني - Support Request",
    BODY: "",
  },
} as const;
```

## المكونات المتاحة

### 1. DriverPageLayout
مكون أساسي لهيكل صفحات السائق مع السايدبار والهيدر.

```tsx
import { DriverPageLayout } from '@/components/driver/common';

<DriverPageLayout 
  title="عنوان الصفحة"
  headerActions={<Button>إجراء</Button>}
  className="custom-class"
>
  {/* محتوى الصفحة */}
</DriverPageLayout>
```

### 2. StatusBanner
مكون لعرض حالة الحساب للسائق (معتمد، معلق، مرفوض، مجمد).

```tsx
import { StatusBanner } from '@/components/driver/common';

<StatusBanner
  status="approved"
  title={t("accountApproved")}
  description={t("accountApprovedDesc")}
  icon={<CheckCircle className="h-6 w-6 text-green-500" />}
  bgColor="bg-green-50"
  borderColor="border-green-500"
  textColor="text-green-800"
  t={t}
/>
```

### 3. StatCard
مكون لعرض الإحصائيات مع أيقونة وقيمة.

```tsx
import { StatCard } from '@/components/driver/common';

<StatCard
  title={t("completedOrders")}
  value={120}
  icon={<Package className="h-6 w-6 text-blue-600" />}
  bgColor="bg-blue-100"
  isLoading={false}
  onClick={() => navigate("/orders")}
/>
```

### 4. LoadingState
مكون لحالة التحميل مع السايدبار.

```tsx
import { LoadingState } from '@/components/driver/common';

if (isLoading) {
  return <LoadingState />;
}
```

### 5. ErrorState
مكون لعرض حالة الخطأ مع إمكانية إعادة التحديث.

```tsx
import { ErrorState } from '@/components/driver/common';

if (error) {
  return <ErrorState onRefresh={() => window.location.reload()} t={t} />;
}
```

## الدوال المساعدة

### formatCurrency
دالة لتنسيق العملة حسب اللغة.

```tsx
import { formatCurrency } from '@/components/driver/common';

const amount = formatCurrency(1250.50, 'ar'); // "1250.50 ر.س"
const amount2 = formatCurrency(1250.50, 'en'); // "SAR 1250.50"
```

### getNotificationIcon
دالة لإرجاع الأيقونة المناسبة حسب نوع الإشعار.

```tsx
import { getNotificationIcon } from '@/components/driver/common';

const icon = getNotificationIcon('order'); // أيقونة الطلب
```

### handleSupabaseError
دالة لمعالجة أخطاء Supabase.

```tsx
import { handleSupabaseError } from '@/components/driver/common';

if (error) {
  handleSupabaseError(error, "fetching driver data");
}
```

### getStatusBannerConfig
دالة لإرجاع إعدادات بانر الحالة.

```tsx
import { getStatusBannerConfig } from '@/components/driver/common';

const config = getStatusBannerConfig(driverData.status, t, navigate);
```

## الثوابت

```tsx
import { 
  NOTIFICATIONS_REFETCH_INTERVAL,
  MAX_NOTIFICATION_DISPLAY,
  NOTIFICATIONS_LIMIT 
} from '@/components/driver/common';
```

### 2. DriverStatsCard
بطاقة لعرض الإحصائيات مع أيقونة وقيمة.

```tsx
import { DriverStatsCard } from '@/components/driver/common';
import { DollarSign } from 'lucide-react';

<DriverStatsCard
  title="الأرباح اليومية"
  value={150}
  icon={DollarSign}
  iconColor="text-green-600"
  iconBgColor="bg-green-100"
  currency={true}
  trend={{ value: 12, isPositive: true }}
/>
```

### 3. DriverNotificationCard
بطاقة لعرض الإشعارات مع إمكانيات التفاعل.

```tsx
import { DriverNotificationCard } from '@/components/driver/common';

<DriverNotificationCard
  notification={notificationObject}
  onMarkAsRead={handleMarkAsRead}
  onDelete={handleDelete}
/>
```

### 4. DriverLoadingSpinner
مؤشر تحميل قابل للتخصيص.

```tsx
import { DriverLoadingSpinner } from '@/components/driver/common';

<DriverLoadingSpinner 
  message="جاري التحميل..."
  size="lg"
  fullScreen={true}
/>
```

### 5. DriverFormCard
بطاقة نموذج مع عنوان وأزرار إجراءات.

```tsx
import { DriverFormCard } from '@/components/driver/common';
import { Settings } from 'lucide-react';

<DriverFormCard
  title="الإعدادات"
  icon={Settings}
  onSubmit={handleSubmit}
  submitText="حفظ"
  cancelText="إلغاء"
  onCancel={handleCancel}
  isLoading={isSubmitting}
>
  {/* محتوى النموذج */}
</DriverFormCard>
```

### 6. DriverContactCard
بطاقة للتواصل مع إجراءات.

```tsx
import { DriverContactCard } from '@/components/driver/common';
import { Phone } from 'lucide-react';

<DriverContactCard
  title="اتصل بنا"
  description="+966 55 616 0601"
  icon={Phone}
  iconColor="text-green-600"
  iconBgColor="bg-green-100"
  actionText="اتصال"
  onAction={handleCall}
/>
```

### 7. DriverActionButton
زر إجراء موحد مع إمكانيات متقدمة.

```tsx
import { DriverActionButton } from '@/components/driver/common';
import { Save } from 'lucide-react';

<DriverActionButton
  label="حفظ التغييرات"
  icon={Save}
  onClick={handleSave}
  loading={isSaving}
  variant="default"
  size="md"
  fullWidth={true}
/>
```

## أمثلة على الاستخدام

### استخدام الثوابت
```typescript
import { SUPPORT_CONTACTS, EMAIL_TEMPLATES } from '@/components/driver/common';

// الاتصال الهاتفي
const makeCall = () => {
  window.location.href = `tel:${SUPPORT_CONTACTS.PHONE.RAW}`;
};

// البريد الإلكتروني
const sendEmail = () => {
  const subject = encodeURIComponent(EMAIL_TEMPLATES.SUPPORT_REQUEST.SUBJECT);
  window.location.href = `mailto:${SUPPORT_CONTACTS.EMAIL}?subject=${subject}`;
};
```

## الميزات

- **دعم اللغتين**: جميع المكونات تدعم العربية والإنجليزية
- **تصميم موحد**: استخدام نفس نظام الألوان والخطوط
- **قابلية التخصيص**: إمكانية تخصيص الألوان والأحجام
- **إمكانية الوصول**: مصممة مع مراعاة معايير الوصول
- **أداء محسن**: تحميل سريع وذاكرة محسنة
- **ثوابت مركزية**: جميع البيانات الثابتة في مكان واحد

## الاستيراد

```tsx
// استيراد مكون واحد
import { DriverPageLayout } from '@/components/driver/common';

// استيراد عدة مكونات
import { 
  DriverPageLayout, 
  DriverStatsCard, 
  DriverActionButton 
} from '@/components/driver/common';
```

## الملاحظات

- تأكد من تشغيل `LanguageProvider` في المستوى الأعلى للتطبيق
- استخدم هذه المكونات بدلاً من إنشاء مكونات مخصصة للحفاظ على التناسق
- راجع التوثيق الخاص بكل مكون للحصول على التفاصيل الكاملة

## المساهمة

عند إضافة مكونات جديدة:
1. تأكد من اتباع نفس نمط التسمية
2. أضف التوثيق المناسب
3. اختبر المكون مع كلا اللغتين
4. أضف المكون إلى ملف `index.ts`
