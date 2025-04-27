import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, MessageSquare, AlertTriangle, CheckCircle, Clock, Star, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

type Notification = {
  id: number;
  type: 'document' | 'order' | 'payment';
  message: string;
  date: string;
  isRead: boolean;
};

const DriverDashboardContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, session } = useAuth();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { data: driverData, isLoading: isLoadingDriver, error: driverError } = useQuery({
    queryKey: ['driver-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (driverError) {
        console.error("Error fetching driver data:", driverError);
        throw driverError;
      }
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching profile data:", profileError);
        throw profileError;
      }
      
      return { ...driver, profile };
    },
    enabled: !!user?.id
  });

  const { data: financialStats, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ['driver-financial-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { count: completedOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', user.id)
        .eq('status', 'completed');
      
      if (ordersError) throw ordersError;
      
      const { data: transactions, error: transactionsError } = await supabase
        .from('financial_transactions')
        .select('amount, transaction_type, status')
        .eq('driver_id', user.id)
        .eq('status', 'completed');
      
      if (transactionsError) throw transactionsError;
      
      const totalEarnings = transactions
        .filter(t => t.transaction_type === 'driver_payout')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      
      const platformCommission = transactions
        .filter(t => t.transaction_type === 'platform_fee')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      
      return {
        completedOrders: completedOrders || 0,
        totalEarnings,
        platformCommission,
        availableBalance: totalEarnings - platformCommission
      };
    },
    enabled: !!user?.id
  });

  const { data: ratingData } = useQuery({
    queryKey: ['driver-rating', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { data, error } = await supabase
        .from('drivers')
        .select('rating')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data?.rating || 0;
    },
    enabled: !!user?.id
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['driver-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: driver, error } = await supabase
        .from('drivers')
        .select('documents, license_image')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      const notifications: Notification[] = [];
      
      if (driver?.documents?.national_id_expiry) {
        const expiryDate = new Date(driver.documents.national_id_expiry);
        const now = new Date();
        const daysToExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysToExpiry < 30) {
          notifications.push({
            id: 1,
            type: 'document',
            message: 'الهوية الوطنية ستنتهي قريبًا، يرجى تحديثها',
            date: expiryDate.toISOString().split('T')[0],
            isRead: false
          });
        }
      }
      
      if (driver?.documents?.license_expiry) {
        const expiryDate = new Date(driver.documents.license_expiry);
        const now = new Date();
        const daysToExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysToExpiry < 30) {
          notifications.push({
            id: 2,
            type: 'document',
            message: 'رخصة القيادة ستنتهي قريبًا، يرجى تحديثها',
            date: expiryDate.toISOString().split('T')[0],
            isRead: false
          });
        }
      }
      
      if (notifications.length < 3) {
        if (financialStats?.availableBalance > 0) {
          notifications.push({
            id: 3,
            type: 'payment',
            message: `تم إيداع مبلغ ${financialStats.availableBalance} ريال في حسابك البنكي`,
            date: new Date().toISOString().split('T')[0],
            isRead: false
          });
        }
      }
      
      return notifications;
    },
    enabled: !!user?.id && !!financialStats
  });

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

        setIsAuthenticated(true);
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

  useEffect(() => {
    if (notificationsData?.length) {
      setNotifications(notificationsData);
    }
  }, [notificationsData]);

  const renderAccountStatusBanner = () => {
    if (!driverData) return null;
    
    if (driverData.status === 'approved') {
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
    if (driverData.status === 'pending') {
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
    if (driverData.status === 'rejected') {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="font-medium text-red-800">تم رفض طلبك</p>
              <p className="text-red-700 text-sm">
                للأسف، تم رفض طلب انضمامك كسائق في منصة سيف دروب.
              </p>
              {driverData.rejection_reason && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800">سبب الرفض:</h3>
                  <p className="text-red-700 mt-2">{driverData.rejection_reason}</p>
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
    if (driverData.status === 'frozen') {
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

  if (isLoadingDriver || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-safedrop-primary mx-auto"></div>
          <h2 className="text-2xl font-bold">{t('loading') || 'جاري التحميل...'}</h2>
        </div>
      </div>
    );
  }
  
  if (driverError) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">خطأ في تحميل البيانات</h2>
          <p className="text-gray-600">حدث خطأ أثناء تحميل بيانات السائق. يرجى المحاولة مرة أخرى.</p>
          <Button onClick={() => window.location.reload()}>تحديث الصفحة</Button>
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
                      <h3 className="text-2xl font-bold">
                        {isLoadingFinancial ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          financialStats?.completedOrders || 0
                        )}
                      </h3>
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
                      <div 
                        className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate('/driver/ratings')}
                      >
                        <h3 className="text-2xl font-bold">{(ratingData || 0).toFixed(1)}</h3>
                        <div className="text-yellow-500 ml-2 text-lg">
                          {Array(5).fill(0).map((_, i) => (
                            <span key={i}>{i < Math.round(ratingData || 0) ? '★' : '☆'}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div 
                      className="bg-yellow-100 p-3 rounded-full cursor-pointer hover:bg-yellow-200 transition-colors"
                      onClick={() => navigate('/driver/ratings')}
                    >
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
                      <h3 className="text-2xl font-bold">
                        {isLoadingFinancial ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          `${financialStats?.availableBalance.toFixed(2) || '0.00'} ر.س`
                        )}
                      </h3>
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
                  {notifications.length === 0 ? (
                    <div className="text-center p-6">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">لا توجد إشعارات جديدة</p>
                    </div>
                  ) : (
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
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="mt-4 w-full"
                    onClick={() => navigate('/driver/notifications')}
                  >
                    عرض كافة الإشعارات
                  </Button>
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
                      <p className="font-medium">
                        {isLoadingFinancial ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          `${financialStats?.totalEarnings.toFixed(2) || '0.00'} ر.س`
                        )}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">عمولة المنصة (15%)</p>
                      <p className="font-medium">
                        {isLoadingFinancial ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          `${financialStats?.platformCommission.toFixed(2) || '0.00'} ر.س`
                        )}
                      </p>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center justify-between font-medium">
                        <p>الرصيد المتاح</p>
                        <p>
                          {isLoadingFinancial ? (
                            <span className="animate-pulse">...</span>
                          ) : (
                            `${financialStats?.availableBalance.toFixed(2) || '0.00'} ر.س`
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex mt-6 gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate('/driver/earnings')}
                    >
                      تفاصيل المدفوعات
                    </Button>
                    <Button 
                      className="bg-safedrop-gold hover:bg-safedrop-gold/90 flex-1"
                      onClick={() => toast({
                        title: "تم إرسال طلب السحب بنجاح",
                        variant: "default",
                        className: "bg-green-500 text-white"
                      })}
                    >
                      طلب سحب
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>الدعم والمساعدة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex items-center justify-center gap-2"
                    onClick={() => navigate('/driver/support')}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>تواصل مع الدعم الفني</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex items-center justify-center gap-2"
                    onClick={() => navigate('/faq')}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>الأسئلة الشائعة</span>
                  </Button>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">هل تواجه مشكلة؟</p>
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => navigate('/driver/support/report-issue')}
                  >
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
