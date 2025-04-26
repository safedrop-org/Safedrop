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
import { UsersIcon, TruckIcon, PackageIcon, LogOutIcon, DollarSign, LineChart, BarChart2Icon, AlertTriangleIcon, BellIcon, UserXIcon, UserCheckIcon, SearchIcon, MoreVerticalIcon, FilterIcon, FileTextIcon, MessageSquareIcon, SettingsIcon, Check, Globe, ShieldIcon, UserCogIcon, Eye, Search, Ban } from 'lucide-react';

// Define types
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
            *,\n            customer:customer_id (\n              first_name,\n              last_name\n            ),\n            driver:driver_id (\n              first_name,\n              last_name\n            )
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
        const settings: Record<string, any> = {};
        (data || []).forEach(item => {
          settings[item.key] = item.value;
        });
        if (settings.commission_rate) {
          setSelectedCommissionRate(parseInt(settings.commission_rate));
        }
        if (settings.system_language) {
          setSystemLanguage(settings.system_language);
        }
        if (settings.privacy_policy) {
          setPrivacyPolicy(settings.privacy_policy);
        }
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
  const {
    data: financialData,
    isLoading: isLoadingFinancial
  } = useQuery({
    queryKey: ['financial-data', dateRange],
    queryFn: async () => {
      try {
        const {
          data,
          error
        } = await supabase.rpc('get_financial_summary', {
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
  const formatCurrency = (value: number) => {
    if (value === undefined || value === null) return "0 ر.س";
    return `${value.toLocaleString()} ر.س`;
  };
  return <div className="flex h-screen bg-gray-50">
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
                
                
                <TabsTrigger value="orders">الطلبات</TabsTrigger>
                <TabsTrigger value="settings">الإعدادات</TabsTrigger>
              </TabsList>
              
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
                                {isLoadingFinancial ? "..." : formatCurrency(financialData?.total_revenue || 0)}
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
                                {isLoadingFinancial ? "..." : formatCurrency(financialData?.commissions || 0)}
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
                                {isLoadingFinancial ? "..." : formatCurrency(financialData?.platform_profit || 0)}
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
                                {isLoadingFinancial ? "..." : formatCurrency(financialData?.driver_profit || 0)}
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
                    <Tabs defaultValue="applications" dir="rtl">
                      <TabsList className="mb-4 justify-end">
                        <TabsTrigger value="applications">طلبات الانضمام</TabsTrigger>
                        <TabsTrigger value="active">السائقين النشطون</TabsTrigger>
                        <TabsTrigger value="suspended">السائقين المعلقون</TabsTrigger>
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
                            <AlertTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            لا توجد سائقين
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
                                {approvedDrivers.map((driver: any) => <TableRow key={driver.id}>
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
                      
                      <TabsContent value="suspended">
                        {isLoadingSuspendedDrivers ? <div className="text-center py-8">جاري تحميل البيانات...</div> : suspendedDrivers.length === 0 ? <div className="text-center py-8 text-gray-500">
                            <AlertTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            لا يوجد سائقين معلقين
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
                                {suspendedDrivers.map((driver: any) => <TableRow key={driver.id}>
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
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="customers">
                {isLoadingCustomersList ? <div className="text-center py-8">جاري تحميل البيانات...</div> : customersList.length === 0 ? <div className="text-center py-8 text-gray-500">
                    <AlertTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    لا يوجد عملاء
                  </div> : <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الاسم</TableHead>
                          <TableHead>رقم الهوية</TableHead>
                          <TableHead>رقم الهاتف</TableHead>
                          <TableHead>الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customersList.map((customer: any) => <TableRow key={customer.id}>
                            <TableCell className="font-medium">
                              {customer.profiles?.first_name} {customer.profiles?.last_name}
                            </TableCell>
                            <TableCell>{customer.national_id}</TableCell>
                            <TableCell>{customer.profiles?.phone}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleActivateUser(customer.id, 'customer')} className="bg-green-600 hover:bg-green-700">
                                  <Check className="h-4 w-4 mr-1" />
                                  تنشيط
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleSuspendUser(customer.id, 'customer')}>
                                  <Ban className="h-4 w-4 mr-1" />
                                  تعليق
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleBanUser(customer.id, 'customer')}>
                                  <ShieldIcon className="h-4 w-4 mr-1" />
                                  حظر
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>
                  </div>}
              </TabsContent>
              
              <TabsContent value="orders">
                {isLoadingOrdersList ? <div className="text-center py-8">جاري تحميل البيانات...</div> : orders.length === 0 ? <div className="text-center py-8 text-gray-500">
                    <AlertTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    لا يوجد طلبات
                  </div> : <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الاسم</TableHead>
                          <TableHead>رقم الهوية</TableHead>
                          <TableHead>رقم الهاتف</TableHead>
                          <TableHead>الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order: any) => <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              {order.customer?.first_name} {order.customer?.last_name}
                            </TableCell>
                            <TableCell>{order.customer?.national_id}</TableCell>
                            <TableCell>{order.customer?.phone}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleApproveDriver(order.driver?.id)} className="bg-green-600 hover:bg-green-700">
                                  <UserCheckIcon className="h-4 w-4 mr-1" />
                                  قبول
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleRejectDriver(order.driver?.id)}>
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
              
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">إعدادات النظام</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="commissions" className="w-full">
                      <TabsList className="mb-6">
                        <TabsTrigger value="commissions">العمولات</TabsTrigger>
                        <TabsTrigger value="language">اللغة</TabsTrigger>
                        <TabsTrigger value="privacy">سياسة الخصوصية</TabsTrigger>
                        <TabsTrigger value="terms">شروط الاستخدام</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="commissions">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="commission-rate">نسبة العمولة (%)</Label>
                            <div className="flex items-center gap-4 mt-1">
                              <Input id="commission-rate" type="number" min="0" max="100" value={selectedCommissionRate.toString()} onChange={e => setSelectedCommissionRate(Number(e.target.value))} className="w-[100px]" />
                              <Button onClick={handleUpdateCommissionRate}>
                                <Check className="h-4 w-4 mr-2" />
                                حفظ
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="language">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>لغة النظام</Label>
                            <div className="flex gap-4">
                              <Button variant={systemLanguage === 'ar' ? 'default' : 'outline'} onClick={() => handleUpdateSystemLanguage('ar')}>
                                العربية
                              </Button>
                              <Button variant={systemLanguage === 'en' ? 'default' : 'outline'} onClick={() => handleUpdateSystemLanguage('en')}>
                                English
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="privacy">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="privacy-policy">سياسة الخصوصية</Label>
                            <Input id="privacy-policy" type="text" value={privacyPolicy} onChange={e => setPrivacyPolicy(e.target.value)} className="w-full" />
                            <Button onClick={handleUpdatePrivacyPolicy}>
                              <Check className="h-4 w-4 mr-2" />
                              حفظ
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="terms">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="terms-of-service">شروط الاستخدام</Label>
                            <Input id="terms-of-service" type="text" value={termsOfService} onChange={e => setTermsOfService(e.target.value)} className="w-full" />
                            <Button onClick={handleUpdateTermsOfService}>
                              <Check className="h-4 w-4 mr-2" />
                              حفظ
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>;
};
const AdminDashboard = () => {
  return <LanguageProvider>
      <AdminDashboardContent />
    </LanguageProvider>;
};
export default AdminDashboard;