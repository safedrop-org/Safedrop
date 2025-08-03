# مكونات نموذج الشكاوى

## نظرة عامة
تحتوي هذه الوحدة على جميع المكونات والأدوات المساعدة المتعلقة بوظائف نموذج الشكاوى، منظمة وفقاً لمبادئ البنية المعمارية النظيفة.

## الهيكل

```
ComplaintForm/
├── index.ts                    # الصادرات الرئيسية
├── types.ts                    # واجهات وأنواع TypeScript
├── utils.ts                    # الدوال المساعدة
├── complaintService.ts         # طبقة الخدمة لاستدعاءات API
├── FileUploadComponent.tsx     # مكون قابل لإعادة الاستخدام لرفع الملفات
└── README.md                   # هذه الوثائق
```

## المكونات

### FileUploadComponent
مكون قابل لإعادة الاستخدام للتعامل مع رفع الملفات مع تتبع التقدم.

**الخصائص:**
- `fileState: FileUploadState` - الملف الحالي وتقدم الرفع
- `onFileChange: (event) => void` - معالج اختيار الملف
- `onRemoveFile: () => void` - معالج إزالة الملف
- `t: (key: string) => string` - دالة الترجمة

**المميزات:**
- دعم السحب والإفلات
- التحقق من نوع الملف
- التحقق من الحجم (الحد الأقصى 5 ميجابايت)
- مؤشر تقدم الرفع
- معاينة الملف مع البيانات الوصفية

## الأنواع

### ComplaintFormValues
```typescript
{
  issue_type: string;
  description: string;
  order_number?: string;
}
```

### ComplaintData
```typescript
{
  user_id: string;
  issue_type: string;
  description: string;
  order_number?: string | null;
  attachment_url?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}
```

### FileUploadState
```typescript
{
  file: File | null;
  progress: number;
}
```

## الخدمات

### uploadFile(file: File, userId: string)
يتعامل مع رفع الملف إلى تخزين Supabase.

**يُرجع:** `Promise<string | null>` - الرابط العام أو null في حالة الفشل

### createNotifications(complaintData, userName, userId, t)
ينشئ إشعارات لكل من تأكيد المستخدم وتنبيهات المشرف.

### sendEmailNotification(complaintData, userId, language)
يرسل تأكيد عبر البريد الإلكتروني للمستخدم (اختياري، لن يفشل إذا كانت الخدمة غير متاحة).

## الأدوات المساعدة

### getIssueTypes(t)
يُرجع خيارات أنواع المشاكل المترجمة.

### getIssueTypeLabel(type, t)
يحصل على التسمية المترجمة لنوع مشكلة محدد.

### validateFile(file, t)
يتحقق من صحة حجم ونوع الملف.

**يُرجع:** `string | null` - رسالة خطأ أو null إذا كان صالحاً

### createComplaintSchema(t)
ينشئ مخطط التحقق من Zod مع رسائل خطأ مترجمة.

## مثال على الاستخدام

```typescript
import { 
  FileUploadComponent,
  createComplaintSchema,
  getIssueTypes,
  uploadFile,
  createNotifications
} from '@/components/driver/common/ComplaintForm';

// في المكون الخاص بك
const schema = createComplaintSchema(t);
const issueTypes = getIssueTypes(t);

// التعامل مع رفع الملف
const handleFileUpload = async (file: File) => {
  const url = await uploadFile(file, userId);
  return url;
};
```

## مميزات الأمان

- ✅ التحقق من نوع الملف (الصور، PDF، النص فقط)
- ✅ حدود حجم الملف (الحد الأقصى 5 ميجابايت)
- ✅ تنظيف المدخلات من خلال مخططات Zod
- ✅ أمان على مستوى الصف من خلال Supabase
- ✅ استدعاءات API آمنة النوع

## تحسينات الأداء

- ✅ التحميل التأخيري لمكون رفع الملفات
- ✅ التحقق من صحة الملف مع التأخير
- ✅ إعادة الرسم المحسنة مع React.memo
- ✅ إدارة حالة فعالة
- ✅ تتبع التقدم لتجربة مستخدم أفضل

## التعامل مع الأخطاء

تتضمن الوحدة التعامل الشامل مع الأخطاء لـ:
- فشل الشبكة
- أخطاء رفع الملفات
- أخطاء التحقق
- أخطاء الصلاحيات
- عدم توفر الخدمة

يتم التعامل مع جميع الأخطاء بلطف وتوفير رسائل سهلة الفهم للمستخدم.