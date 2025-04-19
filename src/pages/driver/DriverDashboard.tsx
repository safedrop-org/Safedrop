
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, MessageSquare, AlertTriangle, CheckCircle, Clock, Star, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const DriverDashboardContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [driverStatus, setDriverStatus] = useState<'approved' | 'pending' | 'rejected' | 'frozen' | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [rejectionCount, setRejectionCount] = useState(0);
  const [notifications, setNotifications] = useState<{ id: number; type: string; message: string; date: string; isRead: boolean; }[]>([]);
  const [driverRating, setDriverRating] = useState<number>(0);
  const [driverStats, setDriverStats] = useState({
    completedOrders: 0,
    totalEarnings: 0,
    platformCommission: 0,
    availableBalance: 0
  });

  // Fetch driver data and authentication status
  useEffect(() => {
    const checkAuthAndData = async () => {
      const driverAuth = localStorage.getItem('driverAuth');
      if (!driverAuth || driverAuth !== 'true') {
        toast({
          title: "غير مصرح بالدخول",
          description: "يرجى تسجيل الدخول أولاً",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          toast({
            title: "غير مصرح بالدخول",
            description: "يرجى تسجيل الدخول أولاً",
            variant: "destructive",
          });
          localStorage.removeItem('driverAuth');
          navigate('/login');
          return;
        }

        // Fetch driver info from 'drivers' table
        const { data: driver, error } = await supabase
          .from('drivers')
          .select('status, rejection_reason, rating')
          .eq('id', session.user.id)
          .single();

        if (error || !driver) {
          toast({
            title: "خطأ في جلب بيانات السائق",
            description: "يرجى التواصل مع الدعم الفني",
            variant: 'destructive',
          });
          navigate('/login');
          return;
        }

        setDriverStatus(driver.status);
        setRejectionReason(driver.rejection_reason || null);
        setDriverRating(driver.rating || 0);

        // Handle statuses
        if (driver.status === 'pending') {
          navigate('/driver/pending-approval');
          return;
        }
        if (driver.status === 'rejected') {
          // Count number of rejections from localStorage, default to 1 if not stored
          const count = Number(localStorage.getItem('driverRejectionCount')) || 1;
          setRejectionCount(count);
          if (count >= 2) {
            // Frozen status
            setDriverStatus('frozen');
            toast({
              title: "تم تعطيل الحساب مؤقتاً",
              description: "تم رفض الحساب مرتين متتاليتين. يرجى التواصل مع الدعم الفني للاستفسار.",
              variant: "destructive",
            });
            return;
          }
        }
        if (driver.status === 'frozen') {
          toast({
            title: "تم تعطيل الحساب مؤقتاً",
            description: "يرجى التواصل مع الدعم الفني للمزيد من المعلومات.",
            variant: "destructive",
          });
          return;
        }
        if (driver.status === 'approved') {
          setIsAuthenticated(true);
          // Initialize driver stats and notifications (mock or from API)
          setDriverStats({
            completedOrders: 132,
            totalEarnings: 8650,
            platformCommission: 1297.50,
            availableBalance: 7352.50
          });
          setNotifications([
            {
              id: 1,
              type: 'document',
              message: 'رخصة القيادة ستنتهي قريبًا، يرجى تحديثها',
              date: '2025-05-01',
              isRead: false
            },
            {
              id: 2,
              type: 'order',
              message: 'لديك طلب توصيل جديد في منطقة العليا',
              date: '2025-04-16',
              isRead: true
            },
            {
              id: 3,
              type: 'payment',
              message: 'تم إيداع مبلغ 750 ريال في حسابك البنكي',
              date: '2025-04-15',
              isRead: false
            }
          ]);
        }
      } catch(error) {
        console.error("Error in driver dashboard init", error);
        toast({
          title: "خطأ في النظام",
          description: "حدث خطأ عند جلب بيانات الحساب",
          variant: "destructive",
        });
        navigate('/login');
      }
    };
    checkAuthAndData();
  }, [navigate, toast]);

  const renderAccountStatusBanner = () => {
    if (driverStatus === 'approved') {
      return (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex items-start">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <p className="font-medium text-green-800">تم اعتماد حسابك</p>
              <p className="text-green-700 text-sm">يمكنك الآن استقبال طلبات التوصيل والبدء في استخدام المنصة</p>
            </div>
          </div>
        </div>
      );
    }
    if (driverStatus === 'pending') {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex items-start">
            <Clock className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <p className="font-medium text-yellow-800">حسابك قيد المراجعة</p>
              <p className="text-yellow-700 text-sm">نحن نراجع بياناتك ووثائقك، وسنعلمك عند الانتهاء من المراجعة</p>
            </div>
          </div>
        </div>
      );
    }
    if (driverStatus === 'rejected') {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="font-medium text-red-800">تم رفض طلبك</p>
              <p className="text-red-700 text-sm">
                للأسف، تم رفض طلب انضمامك كسائق في منصة سيف دروب.
              </p>
              {rejectionReason && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800">سبب الرفض:</h3>
                  <p className="text-red-700 mt-2">{rejectionReason}</p>
                </div>
              )}
              <p className="text-gray-600 mt-4">
                يمكنك تعديل بياناتك وإعادة التقديم مرة واحدة.
              </p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => navigate('/driver/profile')}
              >
                إعادة التقديم
              </Button>
            </div>
          </div>
        </div>
      );
    }
    if (driverStatus === 'frozen') {
      return (
        <div className="bg-red-100 border-l-4 border-red-600 p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <p className="font-bold text-red-700">الحساب مجمد مؤقتاً</p>
              <p className="mt-2 text-red-600">
                تم رفض طلبك كسائق مرتين متتاليتين. يرجى التواصل مع الدعم الفني لتقديم اعتراض أو استفسار.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!isAuthenticated || driverStatus !== 'approved') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-safedrop-primary mx-auto"></div>
          <h2 className="text-2xl font-bold">{t('loading') || 'جاري التحميل...'}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">لوحة تحكم السائق</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            {renderAccountStatusBanner()}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">الطلبات المكتملة</p>
                      <h3 className="text-2xl font-bold">{driverStats.completedOrders}</h3>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">التقييم العام</p>
                      <div className="flex items-center">
                        <h3 className="text-2xl font-bold">{driverRating.toFixed(1)}</h3>
                        <span className="text-yellow-500 ml-2">★★★★★</span>
                      </div>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">الرصيد المتاح</p>
                      <h3 className="text-2xl font-bold">{driverStats.availableBalance} ر.س</h3>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>الإشعارات الأخيرة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.map(notification => (
                      <div key={notification.id} className={`flex items-start p-3 rounded-lg ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}>
                        <div className={`p-2 rounded-full ${
                          notification.type === 'document' ? 'bg-yellow-100 text-yellow-600' : 
                          notification.type === 'order' ? 'bg-blue-100 text-blue-600' : 
                          'bg-green-100 text-green-600'
                        }`}>
                          {notification.type === 'document' && <AlertTriangle className="h-5 w-5" />}
                          {notification.type === 'order' && <Bell className="h-5 w-5" />}
                          {notification.type === 'payment' && <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className={`text-sm ${notification.isRead ? 'font-normal' : 'font-medium'}`}>{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.date}</p>
                        </div>
                        {!notification.isRead && (
                          <Badge className="bg-blue-500">جديد</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" className="mt-4 w-full">عرض كافة الإشعارات</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>ملخص الأرباح</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">إجمالي الأرباح</p>
                      <p className="font-medium">{driverStats.totalEarnings} ر.س</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">عمولة المنصة (15%)</p>
                      <p className="font-medium">{driverStats.platformCommission} ر.س</p>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center justify-between font-medium">
                        <p>الرصيد المتاح</p>
                        <p>{driverStats.availableBalance} ر.س</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex mt-6 gap-3">
                    <Button variant="outline" className="flex-1">تفاصيل المدفوعات</Button>
                    <Button className="bg-safedrop-gold hover:bg-safedrop-gold/90 flex-1">طلب سحب</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* دعم ومساعدة */}
            <Card>
              <CardHeader>
                <CardTitle>الدعم والمساعدة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto py-4 flex items-center justify-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>تواصل مع الدعم الفني</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex items-center justify-center gap-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>الأسئلة الشائعة</span>
                  </Button>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">هل تواجه مشكلة؟</p>
                  <Button variant="secondary" className="w-full">
                    إبلاغ عن مشكلة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

const DriverDashboard = () => {
  return (
    <LanguageProvider>
      <DriverDashboardContent />
    </LanguageProvider>
  );
};

export default DriverDashboard;

