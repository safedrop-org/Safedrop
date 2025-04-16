
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, MessageCircle, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DriverDashboardContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accountStatus, setAccountStatus] = useState<'approved' | 'pending' | 'rejected'>('pending');
  
  // Sample data - in a real app this would come from an API
  const driverStats = {
    completedOrders: 132,
    averageRating: 4.8,
    totalEarnings: 8650,
    platformCommission: 1297.50,
    availableBalance: 7352.50
  };
  
  const notifications = [
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
  ];

  // Check if user is authenticated
  useEffect(() => {
    const driverAuth = localStorage.getItem('driverAuth');
    if (!driverAuth || driverAuth !== 'true') {
      toast({
        title: "غير مصرح بالدخول",
        description: "يرجى تسجيل الدخول أولاً",
        variant: "destructive",
      });
      navigate('/login');
    } else {
      setIsAuthenticated(true);
      
      // In a real app, we would fetch the account status from an API
      // For now, using a random status for demonstration
      const statuses = ['approved', 'pending', 'rejected'];
      const randomStatus = statuses[0]; // Set to approved for demo
      setAccountStatus(randomStatus as 'approved' | 'pending' | 'rejected');
    }
  }, [navigate, toast]);

  const renderAccountStatusBanner = () => {
    switch(accountStatus) {
      case 'approved':
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
      case 'pending':
        return (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <div className="flex items-start">
              <Clock className="h-6 w-6 text-yellow-500 mr-3" />
              <div>
                <p className="font-medium text-yellow-800">حسابك قيد المراجعة</p>
                <p className="text-yellow-700 text-sm">نحن نراجع بياناتك ووثائقك، وسنعلمك عند الانتهاء من المراجعة</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/driver/profile')}
                  className="mt-2"
                >
                  تحديث الوثائق
                </Button>
              </div>
            </div>
          </div>
        );
      case 'rejected':
        return (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <div>
                <p className="font-medium text-red-800">تم رفض طلبك</p>
                <p className="text-red-700 text-sm">يرجى مراجعة الوثائق المقدمة والتأكد من صحتها واكتمالها</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/driver/profile')}
                  className="mt-2"
                >
                  تحديث الوثائق
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center h-screen">جاري التحميل...</div>;
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
                      <p className="text-sm font-medium text-gray-500">تقييمك العام</p>
                      <div className="flex items-center">
                        <h3 className="text-2xl font-bold">{driverStats.averageRating}</h3>
                        <span className="text-yellow-500 ml-2">★★★★★</span>
                      </div>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
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
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
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
            
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>الدعم والمساعدة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto py-4 flex items-center justify-center gap-2">
                      <MessageCircle className="h-5 w-5" />
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
