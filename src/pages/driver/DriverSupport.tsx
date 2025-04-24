
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { MessageSquare, Phone, Mail, HelpCircle } from 'lucide-react';

const DriverSupportContent = () => {
  const { t } = useLanguage();

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">الدعم والمساعدة</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium mb-2">المحادثة المباشرة</h3>
                    <p className="text-sm text-gray-500 mb-4">متاح على مدار الساعة</p>
                    <Button className="w-full">بدء المحادثة</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-medium mb-2">اتصل بنا</h3>
                    <p className="text-sm text-gray-500 mb-4">920001234</p>
                    <Button variant="outline" className="w-full">اتصال</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <Mail className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-medium mb-2">البريد الإلكتروني</h3>
                    <p className="text-sm text-gray-500 mb-4">support@safedrop.com</p>
                    <Button variant="outline" className="w-full">إرسال بريد</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>الأسئلة الشائعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <button className="flex justify-between items-center w-full text-right">
                      <span className="font-medium">كيف يمكنني تحديث معلومات مركبتي؟</span>
                      <HelpCircle className="h-5 w-5 text-gray-400" />
                    </button>
                    <p className="mt-2 text-gray-600 text-sm">
                      يمكنك تحديث معلومات مركبتك من خلال الذهاب إلى صفحة "مركبتي" في لوحة التحكم.
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <button className="flex justify-between items-center w-full text-right">
                      <span className="font-medium">متى يتم تحويل الأرباح؟</span>
                      <HelpCircle className="h-5 w-5 text-gray-400" />
                    </button>
                    <p className="mt-2 text-gray-600 text-sm">
                      يتم تحويل الأرباح بشكل أسبوعي كل يوم خميس.
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <button className="flex justify-between items-center w-full text-right">
                      <span className="font-medium">كيف يمكنني الإبلاغ عن مشكلة في طلب؟</span>
                      <HelpCircle className="h-5 w-5 text-gray-400" />
                    </button>
                    <p className="mt-2 text-gray-600 text-sm">
                      يمكنك الإبلاغ عن المشكلة من خلال الضغط على زر "الإبلاغ" في تفاصيل الطلب.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إرسال استفسار</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الموضوع</label>
                    <Input placeholder="أدخل موضوع الاستفسار" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الرسالة</label>
                    <Textarea 
                      placeholder="اكتب رسالتك هنا..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90">
                    إرسال الاستفسار
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

const DriverSupport = () => {
  return (
    <LanguageProvider>
      <DriverSupportContent />
    </LanguageProvider>
  );
};

export default DriverSupport;
