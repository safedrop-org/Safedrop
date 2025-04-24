
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { Bell, Package, Star, DollarSign, Settings } from 'lucide-react';

const DriverNotificationsContent = () => {
  const { t } = useLanguage();

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">الإشعارات</h1>
              <Button variant="outline" size="sm">
                تحديد الكل كمقروء
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">طلب جديد</p>
                        <p className="text-sm text-gray-600 mt-1">
                          لديك طلب توصيل جديد من حي النخيل إلى حي الملقا
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">منذ 5 دقائق</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="bg-safedrop-gold hover:bg-safedrop-gold/90">
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">تقييم جديد</p>
                        <p className="text-sm text-gray-600 mt-1">
                          حصلت على تقييم 5 نجوم من العميل أحمد محمد
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">منذ ساعة</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">دفعة جديدة</p>
                        <p className="text-sm text-gray-600 mt-1">
                          تم إيداع مبلغ 150 ريال في حسابك
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">منذ 3 ساعات</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">تحديث النظام</p>
                        <p className="text-sm text-gray-600 mt-1">
                          تم تحديث التطبيق إلى الإصدار الجديد
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">منذ يوم</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

const DriverNotifications = () => {
  return (
    <LanguageProvider>
      <DriverNotificationsContent />
    </LanguageProvider>
  );
};

export default DriverNotifications;
