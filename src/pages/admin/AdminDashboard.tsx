
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { supabase } from '@/integrations/supabase/client';
import { IProfile, IDriver } from '@/integrations/supabase/custom-types';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  UsersIcon, TruckIcon, PackageIcon, LogOutIcon, 
  DollarSign, LineChart, BarChart2Icon, FileDownIcon,
  AlertTriangleIcon, BellIcon, UserXIcon, UserCheckIcon,
  SearchIcon, MoreVerticalIcon, FilterIcon,
  FileTextIcon, MessageSquareIcon, SettingsIcon
} from 'lucide-react';

type DateRange = 'today' | 'week' | 'month' | 'year';
type UserType = 'customer' | 'driver';

interface FinancialSummary {
  totalRevenue: number;
  commissions: number;
  platformProfit: number;
  driversPayout: number;
}

interface Complaint {
  id: string;
  userId: string;
  userName: string;
  userType: UserType;
  subject: string;
  content: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: string;
}

const AdminDashboardContent = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommissionRate, setSelectedCommissionRate] = useState(15);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    commissions: 0,
    platformProfit: 0,
    driversPayout: 0
  });

  // Placeholder for mock data (in a real app, this would come from Supabase)
  const mockComplaints: Complaint[] = [
    {
      id: '1',
      userId: 'user123',
      userName: 'محمد أحمد',
      userType: 'customer',
      subject: 'تأخر السائق',
      content: 'السائق وصل متأخر 45 دقيقة عن الموعد المتفق عليه',
      status: 'pending',
      createdAt: '2025-04-15'
    },
    {
      id: '2',
      userId: 'driver456',
      userName: 'عبدالله خالد',
      userType: 'driver',
      subject: 'مشكلة في الدفع',
      content: 'لم يتم استلام المبلغ المستحق للتوصيل رقم #12345',
      status: 'in-progress',
      createdAt: '2025-04-14'
    }
  ];

  // Fetch users count
  const { data: customersCount = 0, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers-count'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('user_type', 'customer');
        
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching customers count:', error);
        return 0;
      }
    }
  });

  // Fetch drivers count
  const { data: driversCount = 0, isLoading: isLoadingDrivers } = useQuery({
    queryKey: ['drivers-count'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('drivers')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching drivers count:', error);
        return 0;
      }
    }
  });

  // Fetch orders count
  const { data: ordersCount = 0, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders-count'],
    queryFn: async () => {
      try {
        // In a real app, this would fetch from an orders table
        // For now, returning a mock value
        return 48;
      } catch (error) {
        console.error('Error fetching orders count:', error);
        return 0;
      }
    }
  });

  // Fetch driver applications
  const { data: driverApplications = [], isLoading: isLoadingApplications } = useQuery({
    queryKey: ['driver-applications'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('drivers')
          .select(`
            id,
            national_id,
            license_number,
            license_image,
            vehicle_info,
            status,
            rejection_reason,
            profiles:id (
              first_name,
              last_name,
              phone
            )
          `)
          .eq('status', 'pending');
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching driver applications:', error);
        return [];
      }
    }
  });

  // Fetch financial data
  useEffect(() => {
    // In a real app, this would come from the database
    // For now, using mock data
    const mockFinancialData = {
      today: {
        totalRevenue: 2500,
        commissions: 375,
        platformProfit: 200,
        driversPayout: 2125
      },
      week: {
        totalRevenue: 15000,
        commissions: 2250,
        platformProfit: 1200,
        driversPayout: 12750
      },
      month: {
        totalRevenue: 65000,
        commissions: 9750,
        platformProfit: 5200,
        driversPayout: 55250
      },
      year: {
        totalRevenue: 780000,
        commissions: 117000,
        platformProfit: 62400,
        driversPayout: 663000
      }
    };

    setFinancialSummary(mockFinancialData[dateRange]);
  }, [dateRange]);

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth || adminAuth !== 'true') {
      navigate('/admin');
    } else {
      setIsAdmin(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const handleExportReport = (format: 'csv' | 'pdf' | 'excel') => {
    // In a real app, this would generate and download the report
    toast.success(`تم تصدير التقرير بصيغة ${format}`);
  };

  const handleUpdateCommissionRate = () => {
    // In a real app, this would update the commission rate in the database
    toast.success(`تم تحديث نسبة العمولة إلى ${selectedCommissionRate}%`);
  };

  const handleApproveDriver = (driverId: string) => {
    // In a real app, this would update the driver status in the database
    toast.success('تم قبول السائق بنجاح');
  };

  const handleRejectDriver = (driverId: string) => {
    // In a real app, this would update the driver status in the database
    toast.success('تم رفض طلب السائق');
  };

  const handleSuspendUser = (userId: string, userType: UserType) => {
    // In a real app, this would update the user status in the database
    toast.success(`تم تعليق حساب ${userType === 'customer' ? 'العميل' : 'السائق'} بنجاح`);
  };

  const handleBanUser = (userId: string, userType: UserType) => {
    // In a real app, this would update the user status in the database
    toast.success(`تم حظر ${userType === 'customer' ? 'العميل' : 'السائق'} بنجاح`);
  };

  const handleResolveComplaint = (complaintId: string) => {
    // In a real app, this would update the complaint status in the database
    toast.success('تم تحديث حالة الشكوى بنجاح');
  };

  if (!isAdmin) {
    return <div className="flex justify-center items-center h-screen">جاري التحميل...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">لوحة تحكم المشرف</h1>
            <Button variant="outline" className="gap-2" onClick={handleLogout}>
              <LogOutIcon className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            {/* Key Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-safedrop-gold" />
                    <span>العملاء</span>
                  </CardTitle>
                  <CardDescription>إجمالي عدد العملاء المسجلين</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {isLoadingCustomers ? (
                      <span className="text-gray-400">...</span>
                    ) : (
                      customersCount
                    )}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TruckIcon className="h-5 w-5 text-safedrop-gold" />
                    <span>السائقين</span>
                  </CardTitle>
                  <CardDescription>إجمالي عدد السائقين المسجلين</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {isLoadingDrivers ? (
                      <span className="text-gray-400">...</span>
                    ) : (
                      driversCount
                    )}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PackageIcon className="h-5 w-5 text-safedrop-gold" />
                    <span>الطلبات</span>
                  </CardTitle>
                  <CardDescription>إجمالي عدد الطلبات</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {isLoadingOrders ? (
                      <span className="text-gray-400">...</span>
                    ) : (
                      ordersCount
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="financial" className="w-full">
              <TabsList className="w-full grid grid-cols-5 mb-6">
                <TabsTrigger value="financial">الملخص المالي</TabsTrigger>
                <TabsTrigger value="drivers">السائقين</TabsTrigger>
                <TabsTrigger value="customers">العملاء</TabsTrigger>
                <TabsTrigger value="orders">الطلبات</TabsTrigger>
                <TabsTrigger value="complaints">الشكاوى والدعم</TabsTrigger>
              </TabsList>
              
              {/* Financial Summary Tab */}
              <TabsContent value="financial" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap justify-between items-center">
                      <CardTitle className="text-xl">الملخص المالي</CardTitle>
                      <div className="flex gap-2">
                        <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="اختر الفترة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">اليوم</SelectItem>
                            <SelectItem value="week">آخر أسبوع</SelectItem>
                            <SelectItem value="month">آخر شهر</SelectItem>
                            <SelectItem value="year">آخر سنة</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleExportReport('csv')}>
                            <FileDownIcon className="h-4 w-4 mr-1" />
                            CSV
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleExportReport('pdf')}>
                            <FileDownIcon className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleExportReport('excel')}>
                            <FileDownIcon className="h-4 w-4 mr-1" />
                            Excel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Financial Statistics */}
                      <div className="space-y-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-gray-500">إجمالي المبالغ المستلمة</p>
                                <h3 className="text-2xl font-bold">{financialSummary.totalRevenue.toLocaleString()} ريال</h3>
                              </div>
                              <div className="p-3 bg-green-100 rounded-full">
                                <DollarSign className="h-6 w-6 text-green-600" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-gray-500">إجمالي العمولات (15%)</p>
                                <h3 className="text-2xl font-bold">{financialSummary.commissions.toLocaleString()} ريال</h3>
                              </div>
                              <div className="p-3 bg-blue-100 rounded-full">
                                <BarChart2Icon className="h-6 w-6 text-blue-600" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-gray-500">أرباح المنصة</p>
                                <h3 className="text-2xl font-bold">{financialSummary.platformProfit.toLocaleString()} ريال</h3>
                              </div>
                              <div className="p-3 bg-violet-100 rounded-full">
                                <LineChart className="h-6 w-6 text-violet-600" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-gray-500">الأرباح المستحقة للسائقين</p>
                                <h3 className="text-2xl font-bold">{financialSummary.driversPayout.toLocaleString()} ريال</h3>
                              </div>
                              <div className="p-3 bg-amber-100 rounded-full">
                                <TruckIcon className="h-6 w-6 text-amber-600" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Commission Settings */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">إعدادات العمولة</CardTitle>
                          <CardDescription>تعديل نسبة العمولة المطبقة على الطلبات</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="commission-rate">نسبة العمولة (%)</Label>
                            <div className="flex gap-2">
                              <Input
                                id="commission-rate"
                                type="number"
                                min="1"
                                max="50"
                                value={selectedCommissionRate}
                                onChange={(e) => setSelectedCommissionRate(parseInt(e.target.value) || 15)}
                                className="w-full"
                              />
                              <Button onClick={handleUpdateCommissionRate}>تحديث</Button>
                            </div>
                            <p className="text-sm text-gray-500">
                              النسبة الحالية: {selectedCommissionRate}%
                            </p>
                          </div>
                          
                          <div className="pt-4 border-t">
                            <h4 className="font-medium mb-2">تفاصيل تطبيق العمولة</h4>
                            <ul className="space-y-1 text-sm text-gray-600">
                              <li>• تطبق العمولة على إجمالي قيمة الطلب</li>
                              <li>• يتم خصم العمولة تلقائياً من مستحقات السائق</li>
                              <li>• يمكن تعديل النسبة في أي وقت</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Drivers Tab */}
              <TabsContent value="drivers" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap justify-between items-center">
                      <CardTitle className="text-xl">إدارة السائقين</CardTitle>
                      <div className="relative">
                        <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <Input
                          placeholder="بحث عن سائق..."
                          className="pl-9 pr-4 w-[250px]"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="applications">
                      <TabsList className="mb-4">
                        <TabsTrigger value="applications">طلبات الانضمام</TabsTrigger>
                        <TabsTrigger value="active">السائقين النشطين</TabsTrigger>
                        <TabsTrigger value="suspended">السائقين المعلقين</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="applications">
                        {isLoadingApplications ? (
                          <div className="text-center py-8">جاري تحميل البيانات...</div>
                        ) : driverApplications.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <AlertTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            لا توجد طلبات انضمام جديدة
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>الاسم</TableHead>
                                  <TableHead>رقم الهوية</TableHead>
                                  <TableHead>رقم الرخصة</TableHead>
                                  <TableHead>معلومات السيارة</TableHead>
                                  <TableHead>الإجراءات</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {driverApplications.map((driver: any) => (
                                  <TableRow key={driver.id}>
                                    <TableCell className="font-medium">
                                      {driver.profiles?.first_name} {driver.profiles?.last_name}
                                    </TableCell>
                                    <TableCell>{driver.national_id}</TableCell>
                                    <TableCell>{driver.license_number}</TableCell>
                                    <TableCell>
                                      {driver.vehicle_info?.make} {driver.vehicle_info?.model} ({driver.vehicle_info?.year})
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleApproveDriver(driver.id)} className="bg-green-600 hover:bg-green-700">
                                          <UserCheckIcon className="h-4 w-4 mr-1" />
                                          قبول
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleRejectDriver(driver.id)}>
                                          <UserXIcon className="h-4 w-4 mr-1" />
                                          رفض
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="active">
                        <div className="text-center py-8 text-gray-500">
                          <TruckIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          يتم عرض السائقين النشطين هنا
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="suspended">
                        <div className="text-center py-8 text-gray-500">
                          <AlertTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          يتم عرض السائقين المعلقين هنا
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Customers Tab */}
              <TabsContent value="customers" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap justify-between items-center">
                      <CardTitle className="text-xl">إدارة العملاء</CardTitle>
                      <div className="flex gap-2">
                        <div className="relative">
                          <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                          <Input
                            placeholder="بحث عن عميل..."
                            className="pl-9 pr-4 w-[250px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <Button variant="outline" size="icon">
                          <FilterIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>الاسم</TableHead>
                            <TableHead>البريد الإلكتروني</TableHead>
                            <TableHead>رقم الهاتف</TableHead>
                            <TableHead>عدد الطلبات</TableHead>
                            <TableHead>الإجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* This would be populated from the database in a real app */}
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                              سيتم عرض بيانات العملاء هنا عندما يتم تسجيلهم
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap justify-between items-center">
                      <CardTitle className="text-xl">مراجعة الطلبات</CardTitle>
                      <div className="flex gap-2">
                        <div className="relative">
                          <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                          <Input
                            placeholder="بحث برقم الطلب..."
                            className="pl-9 pr-4 w-[250px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <Select defaultValue="all">
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="فلترة حسب الحالة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">جميع الطلبات</SelectItem>
                            <SelectItem value="active">طلبات نشطة</SelectItem>
                            <SelectItem value="completed">طلبات مكتملة</SelectItem>
                            <SelectItem value="cancelled">طلبات ملغاة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>رقم الطلب</TableHead>
                            <TableHead>العميل</TableHead>
                            <TableHead>السائق</TableHead>
                            <TableHead>المبلغ</TableHead>
                            <TableHead>التاريخ</TableHead>
                            <TableHead>الحالة</TableHead>
                            <TableHead>الإجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* This would be populated from the database in a real app */}
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                              <PackageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                              سيتم عرض بيانات الطلبات هنا عند إنشائها
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Complaints Tab */}
              <TabsContent value="complaints" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap justify-between items-center">
                      <CardTitle className="text-xl">إدارة الشكاوى والدعم</CardTitle>
                      <div className="flex gap-2">
                        <Select defaultValue="all">
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="فلترة حسب الحالة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">جميع الشكاوى</SelectItem>
                            <SelectItem value="pending">قيد الانتظار</SelectItem>
                            <SelectItem value="in-progress">قيد المعالجة</SelectItem>
                            <SelectItem value="resolved">تم الحل</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockComplaints.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquareIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          لا توجد شكاوى حالياً
                        </div>
                      ) : (
                        mockComplaints.map(complaint => (
                          <Card key={complaint.id}>
                            <CardContent className="pt-6">
                              <div className="flex flex-col md:flex-row justify-between">
                                <div className="space-y-2 mb-4 md:mb-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-medium">{complaint.subject}</h3>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      complaint.status === 'pending' 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : complaint.status === 'in-progress' 
                                          ? 'bg-blue-100 text-blue-800' 
                                          : 'bg-green-100 text-green-800'
                                    }`}>
                                      {complaint.status === 'pending' 
                                        ? 'قيد الانتظار' 
                                        : complaint.status === 'in-progress' 
                                          ? 'قيد المعالجة' 
                                          : 'تم الحل'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">من: {complaint.userName} ({complaint.userType === 'customer' ? 'عميل' : 'سائق'})</p>
                                  <p className="text-sm text-gray-500">تاريخ التقديم: {complaint.createdAt}</p>
                                  <p className="mt-2 text-gray-700">{complaint.content}</p>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                  <Button variant="outline" size="sm">
                                    <MessageSquareIcon className="h-4 w-4 mr-1" />
                                    الرد
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleResolveComplaint(complaint.id)}>
                                    <CheckIcon className="h-4 w-4 mr-1" />
                                    حل الشكوى
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleSuspendUser(complaint.userId, complaint.userType)}>
                                    <AlertTriangleIcon className="h-4 w-4 mr-1" />
                                    تعليق الحساب
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <LanguageProvider>
      <AdminDashboardContent />
    </LanguageProvider>
  );
};

export default AdminDashboard;
