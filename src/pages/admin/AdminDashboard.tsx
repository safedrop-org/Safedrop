
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
  FileTextIcon, MessageSquareIcon, SettingsIcon,
  Check
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

  // Fetch users count
  const { data: customersCount = 0, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers-count'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('user_type', 'customer');
        
        if (error) {
          console.error('Error fetching customers count:', error);
          return 0;
        }
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
        
        if (error) {
          console.error('Error fetching drivers count:', error);
          return 0;
        }
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
        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error('Error fetching orders count:', error);
          return 0;
        }
        return count || 0;
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
            profile_id,
            profiles:profile_id (
              first_name,
              last_name,
              phone
            )
          `)
          .eq('status', 'pending');
        
        if (error) {
          console.error('Error fetching driver applications:', error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.error('Error fetching driver applications:', error);
        return [];
      }
    }
  });

  // Fetch complaints
  const { data: complaints = [], isLoading: isLoadingComplaints } = useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('complaints')
          .select(`
            *,
            profiles:user_id (
              first_name,
              last_name,
              user_type
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching complaints:', error);
          return [];
        }
        
        return (data || []).map(item => ({
          id: item.id,
          userId: item.user_id,
          userName: `${item.profiles?.first_name || ''} ${item.profiles?.last_name || ''}`,
          userType: item.profiles?.user_type as UserType || 'customer',
          subject: item.subject,
          content: item.content,
          status: item.status,
          createdAt: item.created_at
        }));
      } catch (error) {
        console.error('Error fetching complaints:', error);
        return [];
      }
    }
  });

  // Fetch orders
  const { data: orders = [], isLoading: isLoadingOrdersList } = useQuery({
    queryKey: ['orders-list'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            customer:customer_id (
              first_name,
              last_name
            ),
            driver:driver_id (
              first_name,
              last_name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) {
          console.error('Error fetching orders:', error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
      }
    }
  });

  // Fetch customers list
  const { data: customersList = [], isLoading: isLoadingCustomersList } = useQuery({
    queryKey: ['customers-list'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_type', 'customer')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) {
          console.error('Error fetching customers list:', error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.error('Error fetching customers list:', error);
        return [];
      }
    }
  });

  // Fetch financial data
  const { data: financialData, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ['financial-data', dateRange],
    queryFn: async () => {
      try {
        // This would be a real API call to get financial data based on dateRange
        // For now, we'll just return dummy data but will update it when real data is available
        const today = new Date();
        let startDate;
        
        switch (dateRange) {
          case 'today':
            startDate = new Date(today);
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            break;
          case 'month':
            startDate = new Date(today);
            startDate.setMonth(today.getMonth() - 1);
            break;
          case 'year':
            startDate = new Date(today);
            startDate.setFullYear(today.getFullYear() - 1);
            break;
          default:
            startDate = new Date(today);
            startDate.setMonth(today.getMonth() - 1);
        }
        
        // Convert dates to ISO strings for Supabase
        const startDateString = startDate.toISOString();
        const endDateString = today.toISOString();
        
        // Get orders within the date range
        const { data: ordersInRange, error } = await supabase
          .from('orders')
          .select('price, commission_rate, driver_payout')
          .gte('created_at', startDateString)
          .lte('created_at', endDateString);
          
        if (error) {
          console.error('Error fetching financial data:', error);
          return {
            totalRevenue: 0,
            commissions: 0,
            platformProfit: 0,
            driversPayout: 0
          };
        }
        
        // Calculate financial metrics
        const totalRevenue = ordersInRange?.reduce((sum, order) => sum + (order.price || 0), 0) || 0;
        const commissions = ordersInRange?.reduce((sum, order) => sum + (order.commission_rate || 0), 0) || 0;
        const driversPayout = ordersInRange?.reduce((sum, order) => sum + (order.driver_payout || 0), 0) || 0;
        const platformProfit = totalRevenue - driversPayout;
        
        return {
          totalRevenue,
          commissions,
          platformProfit,
          driversPayout
        };
      } catch (error) {
        console.error('Error fetching financial data:', error);
        return {
          totalRevenue: 0,
          commissions: 0,
          platformProfit: 0,
          driversPayout: 0
        };
      }
    }
  });

  useEffect(() => {
    // Update financial summary when data is loaded
    if (financialData) {
      setFinancialSummary(financialData);
    }
  }, [financialData]);

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

  const handleUpdateCommissionRate = async () => {
    try {
      // In a real app, this would update the commission rate in the database
      const { error } = await supabase
        .from('system_settings')
        .upsert({ 
          key: 'commission_rate', 
          value: selectedCommissionRate, 
          updated_at: new Date().toISOString() 
        });
        
      if (error) throw error;
      
      toast.success(`تم تحديث نسبة العمولة إلى ${selectedCommissionRate}%`);
    } catch (error) {
      console.error('Error updating commission rate:', error);
      toast.error('حدث خطأ أثناء تحديث نسبة العمولة');
    }
  };

  const handleApproveDriver = async (driverId: string) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ status: 'approved' })
        .eq('id', driverId);
        
      if (error) throw error;
      
      toast.success('تم قبول السائق بنجاح');
    } catch (error) {
      console.error('Error approving driver:', error);
      toast.error('حدث خطأ أثناء قبول السائق');
    }
  };

  const handleRejectDriver = async (driverId: string) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ 
          status: 'rejected',
          rejection_reason: 'تم رفض الطلب من قبل المشرف'
        })
        .eq('id', driverId);
        
      if (error) throw error;
      
      toast.success('تم رفض طلب السائق');
    } catch (error) {
      console.error('Error rejecting driver:', error);
      toast.error('حدث خطأ أثناء رفض السائق');
    }
  };

  const handleSuspendUser = async (userId: string, userType: UserType) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended' })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast.success(`تم تعليق حساب ${userType === 'customer' ? 'العميل' : 'السائق'} بنجاح`);
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('حدث خطأ أثناء تعليق الحساب');
    }
  };

  const handleBanUser = async (userId: string, userType: UserType) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'banned' })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast.success(`تم حظر ${userType === 'customer' ? 'العميل' : 'السائق'} بنجاح`);
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('حدث خطأ أثناء حظر الحساب');
    }
  };

  const handleResolveComplaint = async (complaintId: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status: 'resolved' })
        .eq('id', complaintId);
        
      if (error) throw error;
      
      toast.success('تم تحديث حالة الشكوى بنجاح');
    } catch (error) {
      console.error('Error resolving complaint:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الشكوى');
    }
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
                                <h3 className="text-2xl font-bold">
                                  {isLoadingFinancial ? (
                                    <span className="text-gray-400">...</span>
                                  ) : (
                                    `${financialSummary.totalRevenue.toLocaleString()} ريال`
                                  )}
                                </h3>
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
                                <h3 className="text-2xl font-bold">
                                  {isLoadingFinancial ? (
                                    <span className="text-gray-400">...</span>
                                  ) : (
                                    `${financialSummary.commissions.toLocaleString()} ريال`
                                  )}
                                </h3>
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
                                <h3 className="text-2xl font-bold">
                                  {isLoadingFinancial ? (
                                    <span className="text-gray-400">...</span>
                                  ) : (
                                    `${financialSummary.platformProfit.toLocaleString()} ريال`
                                  )}
                                </h3>
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
                                <h3 className="text-2xl font-bold">
                                  {isLoadingFinancial ? (
                                    <span className="text-gray-400">...</span>
                                  ) : (
                                    `${financialSummary.driversPayout.toLocaleString()} ريال`
                                  )}
                                </h3>
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
                        {driverApplications.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <TruckIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            لا يوجد سائقين نشطين حاليًا
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            جاري تحميل بيانات السائقين...
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="suspended">
                        <div className="text-center py-8 text-gray-500">
                          <AlertTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          لا يوجد سائقين معلقين حاليًا
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
                            <TableHead>تاريخ التسجيل</TableHead>
                            <TableHead>الإجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoadingCustomersList ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                جاري تحميل بيانات العملاء...
                              </TableCell>
                            </TableRow>
                          ) : customersList.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                لا يوجد عملاء مسجلين حاليًا
                              </TableCell>
                            </TableRow>
                          ) : (
                            customersList.map((customer: any) => (
                              <TableRow key={customer.id}>
                                <TableCell className="font-medium">{customer.first_name} {customer.last_name}</TableCell>
                                <TableCell>{customer.email}</TableCell>
                                <TableCell>{customer.phone}</TableCell>
                                <TableCell>{new Date(customer.created_at).toLocaleDateString('ar-SA')}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                      عرض التفاصيل
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-amber-600 border-amber-600 hover:bg-amber-50"
                                      onClick={() => handleSuspendUser(customer.id, 'customer')}>
                                      تعليق
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
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
                          {isLoadingOrdersList ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                جاري تحميل بيانات الطلبات...
                              </TableCell>
                            </TableRow>
                          ) : orders.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                <PackageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                لا توجد طلبات مسجلة حاليًا
                              </TableCell>
                            </TableRow>
                          ) : (
                            orders.map((order: any) => (
                              <TableRow key={order.id}>
                                <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                                <TableCell>{order.customer?.first_name} {order.customer?.last_name}</TableCell>
                                <TableCell>{order.driver?.first_name} {order.driver?.last_name}</TableCell>
                                <TableCell>{order.price} ريال</TableCell>
                                <TableCell>{new Date(order.created_at).toLocaleDateString('ar-SA')}</TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {order.status === 'pending' ? 'قيد الانتظار' :
                                     order.status === 'in_progress' ? 'قيد التنفيذ' :
                                     order.status === 'completed' ? 'مكتمل' : 'ملغي'}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Button variant="outline" size="sm">عرض التفاصيل</Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
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
                      {isLoadingComplaints ? (
                        <div className="text-center py-8">جاري تحميل البيانات...</div>
                      ) : complaints.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquareIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          لا توجد شكاوى حالياً
                        </div>
                      ) : (
                        complaints.map((complaint) => (
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
                                  <p className="text-sm text-gray-500">تاريخ التقديم: {new Date(complaint.createdAt).toLocaleDateString('ar-SA')}</p>
                                  <p className="mt-2 text-gray-700">{complaint.content}</p>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                  <Button variant="outline" size="sm">
                                    <MessageSquareIcon className="h-4 w-4 mr-1" />
                                    الرد
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleResolveComplaint(complaint.id)}>
                                    <Check className="h-4 w-4 mr-1" />
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
