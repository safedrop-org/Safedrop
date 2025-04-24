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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { supabase } from '@/integrations/supabase/client';
import { IProfile, IDriver } from '@/integrations/supabase/custom-types';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UsersIcon, TruckIcon, PackageIcon, LogOutIcon, DollarSign, LineChart, BarChart2Icon, FileDownIcon, AlertTriangleIcon, BellIcon, UserXIcon, UserCheckIcon, SearchIcon, MoreVerticalIcon, FilterIcon, FileTextIcon, MessageSquareIcon, SettingsIcon, Check, Globe, ShieldIcon, UserCogIcon, Eye } from 'lucide-react';
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
  const {
    t
  } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommissionRate, setSelectedCommissionRate] = useState(15);
  const [systemLanguage, setSystemLanguage] = useState('ar');
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [termsOfService, setTermsOfService] = useState('');
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    commissions: 0,
    platformProfit: 0,
    driversPayout: 0
  });

  // Fetch users count
  const {
    data: customersCount = 0,
    isLoading: isLoadingCustomers,
    refetch: refetchCustomers
  } = useQuery({
    queryKey: ['customers-count'],
    queryFn: async () => {
      try {
        const {
          count,
          error
        } = await supabase.from('profiles').select('*', {
          count: 'exact',
          head: true
        }).eq('user_type', 'customer');
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
  const {
    data: driversCount = 0,
    isLoading: isLoadingDrivers,
    refetch: refetchDrivers
  } = useQuery({
    queryKey: ['drivers-count'],
    queryFn: async () => {
      try {
        const {
          count,
          error
        } = await supabase.from('drivers').select('*', {
          count: 'exact',
          head: true
        });
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
  const {
    data: ordersCount = 0,
    isLoading: isLoadingOrders,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['orders-count'],
    queryFn: async () => {
      try {
        const {
          count,
          error
        } = await supabase.from('orders').select('*', {
          count: 'exact',
          head: true
        });
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
  const {
    data: driverApplications = [],
    isLoading: isLoadingApplications,
    refetch: refetchApplications
  } = useQuery({
    queryKey: ['driver-applications'],
    queryFn: async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('drivers').select(`
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
          `).eq('status', 'pending');
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

  // Fetch approved drivers
  const {
    data: approvedDrivers = [],
    isLoading: isLoadingApprovedDrivers,
    refetch: refetchApprovedDrivers
  } = useQuery({
    queryKey: ['approved-drivers'],
    queryFn: async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('drivers').select(`
            id,
            national_id,
            license_number,
            license_image,
            vehicle_info,
            status,
            rejection_reason,
            rating,
            is_available,
            profile_id,
            profiles:profile_id (
              id,
              first_name,
              last_name,
              phone,
              email,
              created_at
            )
          `).eq('status', 'approved');
        if (error) {
          console.error('Error fetching approved drivers:', error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.error('Error fetching approved drivers:', error);
        return [];
      }
    }
  });

  // Fetch suspended drivers
  const {
    data: suspendedDrivers = [],
    isLoading: isLoadingSuspendedDrivers,
    refetch: refetchSuspendedDrivers
  } = useQuery({
    queryKey: ['suspended-drivers'],
    queryFn: async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('drivers').select(`
            id,
            national_id,
            license_number,
            license_image,
            vehicle_info,
            status,
            rejection_reason,
            profile_id,
            profiles:profile_id (
              id,
              first_name,
              last_name,
              phone,
              email,
              status,
              created_at
            )
          `).eq('status', 'approved').in('profiles.status', ['suspended', 'banned']);
        if (error) {
          console.error('Error fetching suspended drivers:', error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.error('Error fetching suspended drivers:', error);
        return [];
      }
    }
  });

  // Fetch complaints
  const {
    data: complaints = [],
    isLoading: isLoadingComplaints,
    refetch: refetchComplaints
  } = useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('complaints').select(`
            *,
            profiles:user_id (
              first_name,
              last_name,
              user_type
            )
          `).order('created_at', {
          ascending: false
        });
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
  const {
    data: orders = [],
    isLoading: isLoadingOrdersList,
    refetch: refetchOrdersList
  } = useQuery({
    queryKey: ['orders-list'],
    queryFn: async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('orders').select(`
            *,
            customer:customer_id (
              first_name,
              last_name
            ),
            driver:driver_id (
              first_name,
              last_name
            )
          `).order('created_at', {
          ascending: false
        }).limit(20);
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
  const {
    data: customersList = [],
    isLoading: isLoadingCustomersList,
    refetch: refetchCustomersList
  } = useQuery({
    queryKey: ['customers-list'],
    queryFn: async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('profiles').select('*').eq('user_type', 'customer').order('created_at', {
          ascending: false
        }).limit(20);
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

  // Fetch system settings
  const {
    data: systemSettings,
    isLoading: isLoadingSettings
  } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('system_settings').select('*');
        if (error) {
          console.error('Error fetching system settings:', error);
          return null;
        }

        // Convert array to object with key/value pairs
        const settings: Record<string, any> = {};
        (data || []).forEach(item => {
          settings[item.key] = item.value;
        });

        // Set commission rate if exists
        if (settings.commission_rate) {
          setSelectedCommissionRate(parseInt(settings.commission_rate));
        }

        // Set language if exists
        if (settings.system_language) {
          setSystemLanguage(settings.system_language);
        }

        // Set privacy policy if exists
        if (settings.privacy_policy) {
          setPrivacyPolicy(settings.privacy_policy);
        }

        // Set terms of service if exists
        if (settings.terms_of_service) {
          setTermsOfService(settings.terms_of_service);
        }
        return settings;
      } catch (error) {
        console.error('Error fetching system settings:', error);
        return null;
      }
    }
  });

  // Updated financial data fetching using the new database function
  const {
    data: financialData,
    isLoading: isLoadingFinancial
  } = useQuery({
    queryKey: ['financial-data', dateRange],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_financial_summary', {
          period_type: dateRange
        });
        
        if (error) throw error;
        return data || {
          total_revenue: 0,
          commissions: 0,
          platform_profit: 0,
          driver_profit: 0
        };
      } catch (error) {
        console.error('Error fetching financial data:', error);
        return {
          total_revenue: 0,
          commissions: 0,
          platform_profit: 0,
          driver_profit: 0
        };
      }
    }
  });
  
  useEffect(() => {
    // Update financial summary when data is loaded
    if (financialData) {
      setFinancialSummary({
        totalRevenue: financialData.total_revenue || 0,
        commissions: financialData.commissions || 0,
        platformProfit: financialData.platform_profit || 0,
        driversPayout: financialData.driver_profit || 0
      });
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
  
  const handleUpdateCommissionRate = async () => {
    try {
      // In a real app, this would update the commission rate in the database
      const {
        error
      } = await supabase.from('system_settings').upsert({
        key: 'commission_rate',
        value: selectedCommissionRate.toString(),
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      toast.success(`تم تحديث نسبة العمولة إلى ${selectedCommissionRate}%`);
    } catch (error) {
      console.error('Error updating commission rate:', error);
      toast.error('حدث خطأ أثناء تحديث نسبة العمولة');
    }
  };
  
  const handleUpdateSystemLanguage = async (language: string) => {
    try {
      const {
        error
      } = await supabase.from('system_settings').upsert({
        key: 'system_language',
        value: language,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      setSystemLanguage(language);
      toast.success(`تم تحديث لغة النظام إلى ${language === 'ar' ? 'العربية' : 'الإنجليزية'}`);
    } catch (error) {
      console.error('Error updating system language:', error);
      toast.error('حدث خطأ أثناء تحديث لغة النظام');
    }
  };
  
  const handleUpdatePrivacyPolicy = async () => {
    try {
      const {
        error
      } = await supabase.from('system_settings').upsert({
        key: 'privacy_policy',
        value: privacyPolicy,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      toast.success('تم تحديث سياسة الخصوصية بنجاح');
    } catch (error) {
      console.error('Error updating privacy policy:', error);
      toast.error('حدث خطأ أثناء تحديث سياسة الخصوصية');
    }
  };
  
  const handleUpdateTermsOfService = async () => {
    try {
      const {
        error
      } = await supabase.from('system_settings').upsert({
        key: 'terms_of_service',
        value: termsOfService,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      toast.success('تم تحديث شروط الاستخدام بنجاح');
    } catch (error) {
      console.error('Error updating terms of service:', error);
      toast.error('حدث خطأ أثناء تحديث شروط الاستخدام');
    }
  };
  
  const handleApproveDriver = async (driverId: string) => {
    try {
      const {
        error
      } = await supabase.from('drivers').update({
        status: 'approved'
      }).eq('id', driverId);
      if (error) throw error;
      refetchApplications();
      refetchApprovedDrivers();
      refetchDrivers();
      toast.success('تم قبول السائق بنجاح');
    } catch (error) {
      console.error('Error approving driver:', error);
      toast.error('حدث خطأ أثناء قبول السائق');
    }
  };
  
  const handleRejectDriver = async (driverId: string) => {
    try {
      const {
        error
      } = await supabase.from('drivers').update({
        status: 'rejected',
        rejection_reason: 'تم رفض الطلب من قبل المشرف'
      }).eq('id', driverId);
      if (error) throw error;
      refetchApplications();
      refetchDrivers();
      toast.success('تم رفض طلب السائق');
    } catch (error) {
      console.error('Error rejecting driver:', error);
      toast.error('حدث خطأ أثناء رفض السائق');
    }
  };
  
  const handleDeleteRejectedApplications = async () => {
    try {
      const {
        error
      } = await supabase.from('drivers').delete().eq('status', 'rejected');
      if (error) throw error;
      refetchApplications();
      refetchDrivers();
      toast.success('تم حذف جميع طلبات الإنضمام المرفوضة بنجاح');
    } catch (error) {
      console.error('Error deleting rejected applications:', error);
      toast.error('حدث خطأ أثناء حذف طلبات الإنضمام المرفوضة');
    }
  };
  
  const handleSuspendUser = async (userId: string, userType: UserType) => {
    try {
      const {
        error
      } = await supabase.from('profiles').update({
        status: 'suspended'
      }).eq('id', userId);
      if (error) throw error;
      if (userType === 'driver') {
        refetchApprovedDrivers();
        refetchSuspendedDrivers();
      } else {
        refetchCustomersList();
      }
      toast.success(`تم تعليق حساب ${userType === 'customer' ? 'العميل' : 'السائق'} بنجاح`);
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('حدث خطأ أثناء تعليق الحساب');
    }
  };
  
  const handleBanUser = async (userId: string, userType: UserType) => {
    try {
      const {
        error
      } = await supabase.from('profiles').update({
        status: 'banned'
      }).eq('id', userId);
      if (error) throw error;
      if (userType === 'driver') {
        refetchApprovedDrivers();
        refetchSuspendedDrivers();
      } else {
        refetchCustomersList();
      }
      toast.success(`تم حظر ${userType === 'customer' ? 'العميل' : 'السائق'} بنجاح`);
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('حدث خطأ أثناء حظر الحساب');
    }
  };
  
  const handleActivateUser = async (userId: string, userType: UserType) => {
    try {
      const {
        error
      } = await supabase.from('profiles').update({
        status: 'active'
      }).eq('id', userId);
      if (error) throw error;
      if (userType === 'driver') {
        refetchApprovedDrivers();
        refetchSuspendedDrivers();
      } else {
        refetchCustomersList();
      }
      toast.success(`تم تنشيط حساب ${userType === 'customer' ? 'العميل' : 'السائق'} بنجاح`);
    } catch (error) {
      console.error('Error activating user:', error);
      toast.error('حدث خطأ أثناء تنشيط الحساب');
    }
  };
  
  const handleResolveComplaint = async (complaintId: string) => {
    try {
      const {
        error
      } = await supabase.from('complaints').update({
        status: 'resolved'
      }).eq('id', complaintId);
      if (error) throw error;
      refetchComplaints();
      toast.success('تم تحديث حالة الشكوى بنجاح');
    } catch (error) {
      console.error('Error resolving complaint:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الشكوى');
    }
  };
  
  const handleProcessComplaint = async (complaintId: string) => {
    try {
      const {
        error
      } = await supabase.from('complaints').update({
        status: 'in-progress'
      }).eq('id', complaintId);
      if (error) throw error;
      refetchComplaints();
      toast.success('تم تحديث حالة الشكوى إلى قيد المعالجة');
    } catch (error) {
      console.error('Error processing complaint:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الشكوى');
    }
  };
  
  const handleDeleteCustomer = async (userId: string) => {
    try {
      // إذا كان هناك طلبات مرتبطة بالعميل، فقد نحتاج إلى تحديث حالتها أو إزالتها أيضًا

      // حذف العميل
      const {
        error
      } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      refetchCustomersList();
      refetchCustomers();
      toast.success('تم حذف العميل بنجاح');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('حدث خطأ أثناء حذف العميل');
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
                    {isLoadingCustomers ? <span className="text-gray-400">...</span> : customersCount}
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
                    {isLoadingDrivers ? <span className="text-gray-400">...</span> : driversCount}
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
                    {isLoadingOrders ? <span className="text-gray-400">...</span> : ordersCount}
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
                <TabsTrigger value="settings">الإعدادات</TabsTrigger>
              </TabsList>
              
              {/* Financial Summary Tab */}
              <TabsContent value="financial" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap justify-between items-center">
                      <CardTitle className="text-xl">الملخص المالي</CardTitle>
                      <Select value={dateRange} onValueChange={value => setDateRange(value as DateRange)}>
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
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-500">إجمالي المبالغ المستلمة</p>
                              <h3 className="text-2xl font-bold">
                                {isLoadingFinancial ? "..." : 
                                 `${financialData?.total_revenue?.toLocaleString()} ر.س`}
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
                              <p className="text-sm text-gray-500">إجمالي العمولات</p>
                              <h3 className="text-2xl font-bold">
                                {isLoadingFinancial ? "..." :
                                 `${financialData?.commissions?.toLocaleString()} ر.س`}
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
                                {isLoadingFinancial ? "..." :
                                 `${financialData?.platform_profit?.toLocaleString()} ر.س`}
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
                              <p className="text-sm text-gray-500">مستحقات السائقين</p>
                              <h3 className="text-2xl font-bold">
                                {isLoadingFinancial ? "..." :
                                 `${financialData?.driver_profit?.toLocaleString()} ر.س`}
                              </h3>
                            </div>
                            <div className="p-3 bg-amber-100 rounded-full">
                              <TruckIcon className="h-6 w-6 text-amber-600" />
                            </div>
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
                      <div className="flex gap-2 items-center">
                        <div className="relative">
                          <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                          <Input placeholder="بحث عن سائق..." className="pl-9 pr-4 w-[250px]" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        {driverApplications && driverApplications.some((driver: any) => driver.status === 'rejected') && <Button variant="destructive" size="sm" onClick={handleDeleteRejectedApplications} className="whitespace-nowrap">
                            حذف الطلبات المرفوضة
                          </Button>}
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
                        {isLoadingApplications ? <div className="text-center py-8">جاري تحميل البيانات...</div> : driverApplications.length === 0 ? <div className="text-center py-8 text-gray-500">
                            <AlertTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            لا توجد طلبات انضمام جديدة
                          </div> : <div className="overflow-x-auto">
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
                                {driverApplications.map((driver: any) => <TableRow key={driver.id}>
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
                                  </TableRow>)}
                              </TableBody>
                            </Table>
                          </div>}
                      </TabsContent>
                      
                      <TabsContent value="active">
                        {isLoadingApprovedDrivers ? <div className="text-center py-8">جاري تحميل البيانات...</div> : approvedDrivers.length === 0 ? <div className="text-center py-8 text-gray-500">
                            <TruckIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            لا يوجد سائقين نشطين حاليًا
                          </div> : <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>الاسم</TableHead>
                                  <TableHead>البريد الإلكتروني</TableHead>
                                  <TableHead>رقم الهاتف</TableHead>
                                  <TableHead>نوع السيارة</TableHead>
                                  <TableHead>التقييم</TableHead>
                                  <TableHead>الإجراءات</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {approvedDrivers.filter((driver: any) => !driver.profiles?.status || driver.profiles?.status === 'active').filter((driver: any) => {
                              if (!searchQuery) return true;
                              const fullName = `${driver.profiles?.first_name} ${driver.profiles?.last_name}`.toLowerCase();
                              const email = driver.profiles?.email?.toLowerCase() || '';
                              const phone = driver.profiles?.phone || '';
                              const query = searchQuery.toLowerCase();
                              return fullName.includes(query) || email.includes(query) || phone.includes(query);
                            }).map((driver: any) => <TableRow key={driver.id}>
                                      <TableCell className="font-medium">
                                        {driver.profiles?.first_name} {driver.profiles?.last_name}
                                      </TableCell>
                                      <TableCell>{driver.profiles?.email}</TableCell>
                                      <TableCell>{driver.profiles?.phone}</TableCell>
                                      <TableCell>
                                        {driver.vehicle_info?.make} {driver.vehicle_info?.model}
                                      </TableCell>
                                      <TableCell>
                                        {driver.rating ? <span>{driver.rating} / 5</span> : <span className="text-gray-400">لا يوجد تقييم</span>}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex gap-2">
                                          <Button variant="outline" size="sm">
                                            <Eye className="h-4 w-4 mr-1" />
                                            عرض
                                          </Button>
                                          <Button variant="outline" size="sm" className="text-amber-600 border-amber-600 hover:bg-amber-50" onClick={() => handleSuspendUser(driver.profiles?.id, 'driver')}>
                                            تعليق
                                          </Button>
                                          <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleBanUser(driver.profiles?.id, 'driver')}>
                                            حظر
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>)}
                              </TableBody>
                            </Table>
                          </div>}
                      </TabsContent>
                      
                      <TabsContent value="suspended">
                        {isLoadingSuspendedDrivers ? <div className="text-center py-8">جاري تحميل البيانات...</div> : suspendedDrivers.length === 0 ? <div className="text-center py-8 text-gray-500">
                            <AlertTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            لا يوجد سائقين معلقين حاليًا
                          </div> : <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>الاسم</TableHead>
                                  <TableHead>البريد الإلكتروني</TableHead>
                                  <TableHead>رقم الهاتف</TableHead>
                                  <TableHead>الحالة</TableHead>
                                  <TableHead>الإجراءات</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {suspendedDrivers.map((driver: any) => <TableRow key={driver.id}>
                                    <TableCell className="font-medium">
                                      {driver.profiles?.first_name} {driver.profiles?.last_name}
                                    </TableCell>
                                    <TableCell>{driver.profiles?.email}</TableCell>
                                    <TableCell>{driver.profiles?.phone}</TableCell>
                                    <TableCell>
                                      <span className={`px-2 py-1 text-xs rounded-full ${driver.profiles?.status === 'suspended' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                        {driver.profiles?.status === 'suspended' ? 'معلق' : 'محظور'}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleActivateUser(driver.profiles?.id, 'driver')}>
                                          <UserCheckIcon className="h-4 w-4 mr-1" />
                                          إعادة تنشيط
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>)}
                              </TableBody>
                            </Table>
                          </div>}
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
                      <div className="relative w-full md:w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          placeholder="بحث عن عميل..." 
                          className="pr-9" 
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                        />
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
                            <TableHead>الحالة</TableHead>
                            <TableHead>الإجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoadingCustomersList ? <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                جاري تحميل بيانات العملاء...
                              </TableCell>
                            </TableRow> : customersList.length === 0 ? <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                لا يوجد عملاء مسجلين حاليًا
                              </TableCell>
                            </TableRow> : customersList.filter((customer: any) => {
                          if (!searchQuery) return true;
                          const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
                          const email = customer.email?.toLowerCase() || '';
                          const phone = customer.phone || '';
                          const query = searchQuery.toLowerCase();
                          return fullName.includes(query) || email.includes(query) || phone.includes(query);
                        }).map((customer: any) => <TableRow key={customer.id}>
                                  <TableCell className="font-medium">{customer.first_name} {customer.last_name}</TableCell>
                                  <TableCell>{customer.email}</TableCell>
                                  <TableCell>{customer.phone}</TableCell>
                                  <TableCell>{new Date(customer.created_at).toLocaleDateString('ar-SA')}</TableCell>
                                  <TableCell>
                                    <span className={`px-2 py-1 text-xs rounded-full ${!customer.status || customer.status === 'active' ? 'bg-green-100 text-green-800' : customer.status === 'suspended' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                      {!customer.status || customer.status === 'active' ? 'نشط' : customer.status === 'suspended' ? 'معلق' : 'محظور'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4 mr-1" />
                                        عرض
                                      </Button>
                                      {!customer.status || customer.status === 'active' ? <>
                                          <Button variant="outline" size="sm" className="text-amber-600 border-amber-600 hover:bg-amber-50" onClick={() => handleSuspendUser(customer.id, 'customer')}>
                                            تعليق
                                          </Button>
                                          <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleBanUser(customer.id, 'customer')}>
                                            حظر
                                          </Button>
                                        </> : <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleActivateUser(customer.id, 'customer')}>
                                          إعادة تنشيط
                                        </Button>}
                                      <Button variant="destructive" size="sm" onClick={() => handleDeleteCustomer(customer.id)}>
                                        حذف
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>)}
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
                          <Input placeholder="بحث برقم الطلب..." className="pl-9 pr-4 w-[250px]" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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
                          {isLoadingOrdersList ? <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                جاري تحميل بيانات الطلبات...
                              </TableCell>
                            </TableRow> : orders.length === 0 ? <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                <PackageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                لا توجد طلبات مسجلة حاليًا
                              </TableCell>
                            </TableRow> : orders.filter((order: any) => {
                          if (!searchQuery) return true;
                          return order.id.toLowerCase().includes(searchQuery.toLowerCase());
                        }).map((order: any) => <TableRow key={order.id}>
                                  <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                                  <TableCell>{order.customer?.first_name} {order.customer?.last_name}</TableCell>
                                  <TableCell>{order.driver?.first_name} {order.driver?.last_name}</TableCell>
                                  <TableCell>{order.price} ريال</TableCell>
                                  <TableCell>{new Date(order.created_at).toLocaleDateString('ar-SA')}</TableCell>
                                  <TableCell>
                                    <span className={`px-2 py-1 text-xs rounded-full ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {order.status === 'pending' ? 'قيد الانتظار' : order.status === 'in_progress' ? 'قيد التنفيذ' : order.status === 'completed' ? 'مكتمل' : 'ملغي'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Button variant="outline" size="sm">
                                      <Eye className="h-4 w-4 mr-1" />
                                      عرض التفاصيل
                                    </Button>
                                  </TableCell>
                                </TableRow>)}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Settings Tab - New */}
              <TabsContent value="settings" className="space-y-4">
                <Tabs defaultValue="commission">
                  <TabsList className="mb-4">
                    <TabsTrigger value="commission">العمولة</TabsTrigger>
                    <TabsTrigger value="language">اللغة</TabsTrigger>
                    <TabsTrigger value="terms">الشروط والأحكام</TabsTrigger>
                    <TabsTrigger value="complaints">الشكاوى والدعم</TabsTrigger>
                  </TabsList>
                  
                  {/* Commission Settings */}
                  <TabsContent value="commission">
                    <Card>
                      <CardHeader>
                        <CardTitle>إعدادات العمولة</CardTitle>
                        <CardDescription>تعديل نسبة العمولة المطبقة على الطلبات</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="settings-commission-rate">نسبة العمولة (%)</Label>
                          <div className="flex gap-2">
                            <Input id="settings-commission-rate" type="number" min="1" max="50" value={selectedCommissionRate} onChange={e => setSelectedCommissionRate(parseInt(e.target.value) || 15)} className="w-full" />
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
                  </TabsContent>
                  
                  {/* Language Settings */}
                  <TabsContent value="language">
                    <Card>
                      <CardHeader>
                        <CardTitle>إعدادات اللغة</CardTitle>
                        <CardDescription>تحديد لغة واجهة التطبيق</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 space-x-reverse">
                              <Globe className="h-5 w-5 text-safedrop-primary" />
                              <div>
                                <h4 className="font-medium">اللغة العربية</h4>
                                <p className="text-sm text-gray-500">تفعيل اللغة العربية كلغة افتراضية</p>
                              </div>
                            </div>
                            <Button variant={systemLanguage === 'ar' ? 'default' : 'outline'} onClick={() => handleUpdateSystemLanguage('ar')}>
                              {systemLanguage === 'ar' ? 'مفعلة' : 'تفعيل'}
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 space-x-reverse">
                              <Globe className="h-5 w-5 text-safedrop-primary" />
                              <div>
                                <h4 className="font-medium">اللغة الإنجليزية</h4>
                                <p className="text-sm text-gray-500">تفعيل اللغة الإنجليزية كلغة افتراضية</p>
                              </div>
                            </div>
                            <Button variant={systemLanguage === 'en' ? 'default' : 'outline'} onClick={() => handleUpdateSystemLanguage('en')}>
                              {systemLanguage === 'en' ? 'مفعلة' : 'تفعيل'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Terms & Privacy Settings */}
                  <TabsContent value="terms">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>شروط الاستخدام</CardTitle>
                          <CardDescription>تعديل شروط استخدام التطبيق</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="terms-of-service">شروط الاستخدام</Label>
                            <textarea id="terms-of-service" rows={10} value={termsOfService} onChange={e => setTermsOfService(e.target.value)} className="w-full border border-gray-300 p-2 rounded-md" placeholder="أدخل شروط استخدام التطبيق هنا..."></textarea>
                          </div>
                          <Button onClick={handleUpdateTermsOfService}>حفظ التغييرات</Button>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>سياسة الخصوصية</CardTitle>
                          <CardDescription>تعديل سياسة خصوصية التطبيق</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="privacy-policy">سياسة الخصوصية</Label>
                            <textarea id="privacy-policy" rows={10} value={privacyPolicy} onChange={e => setPrivacyPolicy(e.target.value)} className="w-full border border-gray-300 p-2 rounded-md" placeholder="أدخل سياسة خصوصية التطبيق هنا..."></textarea>
                          </div>
                          <Button onClick={handleUpdatePrivacyPolicy}>حفظ التغييرات</Button>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  {/* Complaints Tab */}
                  <TabsContent value="complaints">
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
                          {isLoadingComplaints ? <div className="text-center py-8">جاري تحميل البيانات...</div> : complaints.length === 0 ? <div className="text-center py-8 text-gray-500">
                              <MessageSquareIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                              لا توجد شكاوى حالياً
                            </div> : complaints.map(complaint => <Card key={complaint.id}>
                                <CardContent className="pt-6">
                                  <div className="flex flex-col md:flex-row justify-between">
                                    <div className="space-y-2 mb-4 md:mb-0">
                                      <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-medium">{complaint.subject}</h3>
                                        <span className={`px-2 py-1 text-xs rounded-full ${complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : complaint.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                          {complaint.status === 'pending' ? 'قيد الانتظار' : complaint.status === 'in-progress' ? 'قيد المعالجة' : 'تم الحل'}
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
                                      {complaint.status === 'pending' && <Button variant="outline" size="sm" onClick={() => handleProcessComplaint(complaint.id)}>
                                          <UserCogIcon className="h-4 w-4 mr-1" />
                                          بدء المعالجة
                                        </Button>}
                                      {complaint.status !== 'resolved' && <Button variant="outline" size="sm" onClick={() => handleResolveComplaint(complaint.id)}>
                                          <Check className="h-4 w-4 mr-1" />
                                          حل الشكوى
                                        </Button>}
                                      <Button variant="outline" size="sm" onClick={() => handleSuspendUser(complaint.userId, complaint.userType)}>
                                        <AlertTriangleIcon className="h-4 w-4 mr-1" />
                                        تعليق الحساب
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>)}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
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
