
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { LogOutIcon, SearchIcon, EyeIcon, CheckIcon, XIcon, AlertTriangleIcon, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { IDriver, IProfile } from '@/integrations/supabase/custom-types';

interface DriverWithProfile extends IDriver {
  profiles: IProfile;
}

const DriverVerificationContent = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<DriverWithProfile | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewDocumentUrl, setViewDocumentUrl] = useState('');
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [pendingDrivers, setPendingDrivers] = useState<DriverWithProfile[]>([]);
  const [approvedDrivers, setApprovedDrivers] = useState<DriverWithProfile[]>([]);
  const [rejectedDrivers, setRejectedDrivers] = useState<DriverWithProfile[]>([]);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth || adminAuth !== 'true') {
      navigate('/admin');
    } else {
      setIsAdmin(true);
      fetchDrivers();
    }
  }, [navigate]);

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const { data: drivers, error } = await supabase
        .from('drivers')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching drivers:", error);
        toast.error("حدث خطأ أثناء جلب بيانات السائقين");
        setIsLoading(false);
        return;
      }

      const typedDrivers = drivers as unknown as DriverWithProfile[];

      setPendingDrivers(typedDrivers.filter(driver => driver.status === 'pending'));
      setApprovedDrivers(typedDrivers.filter(driver => driver.status === 'approved'));
      setRejectedDrivers(typedDrivers.filter(driver => driver.status === 'rejected'));
    } catch (error) {
      console.error("Error in fetchDrivers:", error);
      toast.error("حدث خطأ أثناء جلب بيانات السائقين");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const handleApproveDriver = async (driver: DriverWithProfile) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ status: 'approved' })
        .eq('id', driver.id);

      if (error) throw error;

      toast.success(`تمت الموافقة على السائق ${driver.profiles.first_name} ${driver.profiles.last_name} بنجاح`);
      await fetchDrivers();

    } catch (error) {
      console.error("Error approving driver:", error);
      toast.error("حدث خطأ أثناء الموافقة على السائق");
    }
  };

  const handleOpenRejectDialog = (driver: DriverWithProfile) => {
    setSelectedDriver(driver);
    setRejectDialogOpen(true);
  };

  const handleRejectDriver = async () => {
    if (!selectedDriver || !rejectionReason.trim()) return;

    try {
      const { error } = await supabase
        .from('drivers')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason 
        })
        .eq('id', selectedDriver.id);

      if (error) throw error;

      toast.success(`تم رفض السائق ${selectedDriver.profiles.first_name} ${selectedDriver.profiles.last_name} بنجاح`);
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedDriver(null);
      await fetchDrivers();

    } catch (error) {
      console.error("Error rejecting driver:", error);
      toast.error("حدث خطأ أثناء رفض السائق");
    }
  };

  const handleViewDocument = (url: string) => {
    setViewDocumentUrl(url);
    setDocumentDialogOpen(true);
  };

  const filterDrivers = (drivers: DriverWithProfile[]) => {
    if (!searchQuery) return drivers;

    return drivers.filter(driver => {
      const fullName = `${driver.profiles.first_name} ${driver.profiles.last_name}`;
      return (
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.national_id.includes(searchQuery) ||
        driver.profiles.phone.includes(searchQuery)
      );
    });
  };

  if (!isAdmin) {
    return <div className="flex justify-center items-center h-screen">جاري التحميل...</div>;
  }

  const filteredPendingDrivers = filterDrivers(pendingDrivers);
  const filteredApprovedDrivers = filterDrivers(approvedDrivers);
  const filteredRejectedDrivers = filterDrivers(rejectedDrivers);

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">إدارة وتوثيق السائقين</h1>
            <Button variant="outline" className="gap-2" onClick={handleLogout}>
              <LogOutIcon className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="relative w-full max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-10 pr-4"
                  placeholder="ابحث باسم السائق أو رقم الهوية أو رقم الهاتف"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="pending" className="relative">
                  طلبات قيد الانتظار
                  {filteredPendingDrivers.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {filteredPendingDrivers.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved">السائقين المعتمدين</TabsTrigger>
                <TabsTrigger value="rejected">الطلبات المرفوضة</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">طلبات انضمام السائقين قيد الانتظار</h3>

                {isLoading ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary mb-4" />
                      <p className="text-gray-500">جاري تحميل البيانات...</p>
                    </div>
                  </div>
                ) : filteredPendingDrivers.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <CheckIcon className="h-12 w-12 text-green-500 mb-4" />
                      <p className="text-gray-500">لا توجد طلبات قيد الانتظار</p>
                    </div>
                  </div>
                ) : (
                  filteredPendingDrivers.map(driver => (
                    <Card key={driver.id} className="mb-4">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-lg font-semibold">
                                {driver.profiles.first_name} {driver.profiles.last_name}
                              </h4>
                              <p className="text-gray-500">
                                تاريخ التقديم: {new Date(driver.profiles.created_at).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">رقم الهوية:</p>
                                <p>{driver.national_id}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">رقم الهاتف:</p>
                                <p>{driver.profiles.phone}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">البريد الإلكتروني:</p>
                                <p className="break-all">{driver.profiles.id}</p>
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">تفاصيل السيارة:</p>
                                <p>
                                  {driver.vehicle_info.make} {driver.vehicle_info.model} {driver.vehicle_info.year} - 
                                  لوحة رقم: {driver.vehicle_info.plateNumber}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 md:mt-0 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center justify-end">
                                {driver.documents?.national_id_image ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="ml-2"
                                    onClick={() => handleViewDocument(driver.documents.national_id_image)}
                                  >
                                    <EyeIcon className="h-4 w-4 mr-1" />
                                    عرض الهوية
                                  </Button>
                                ) : (
                                  <span className="text-gray-400 text-sm">لا يوجد صورة للهوية</span>
                                )}
                              </div>
                              <div className="flex items-center justify-end">
                                {driver.license_image ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="ml-2"
                                    onClick={() => handleViewDocument(driver.license_image)}
                                  >
                                    <EyeIcon className="h-4 w-4 mr-1" />
                                    عرض الرخصة
                                  </Button>
                                ) : (
                                  <span className="text-gray-400 text-sm">لا يوجد صورة للرخصة</span>
                                )}
                              </div>
                            </div>

                            <div className="flex space-x-2 rtl:space-x-reverse mt-4">
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApproveDriver(driver)}
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                موافقة
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleOpenRejectDialog(driver)}
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                رفض
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="approved" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">السائقين المعتمدين</h3>

                {isLoading ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary mb-4" />
                      <p className="text-gray-500">جاري تحميل البيانات...</p>
                    </div>
                  </div>
                ) : filteredApprovedDrivers.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangleIcon className="h-12 w-12 text-yellow-500 mb-4" />
                      <p className="text-gray-500">لا يوجد سائقين معتمدين حتى الآن</p>
                    </div>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 text-xs uppercase">
                            <tr>
                              <th className="px-6 py-3 text-right font-medium text-gray-500">الاسم</th>
                              <th className="px-6 py-3 text-right font-medium text-gray-500">رقم الهوية</th>
                              <th className="px-6 py-3 text-right font-medium text-gray-500">رقم الهاتف</th>
                              <th className="px-6 py-3 text-right font-medium text-gray-500">تفاصيل السيارة</th>
                              <th className="px-6 py-3 text-right font-medium text-gray-500">تاريخ الانضمام</th>
                              <th className="px-6 py-3 text-right font-medium text-gray-500">الإجراءات</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredApprovedDrivers.map(driver => (
                              <tr key={driver.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {driver.profiles.first_name} {driver.profiles.last_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{driver.national_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{driver.profiles.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {driver.vehicle_info.make} {driver.vehicle_info.model} {driver.vehicle_info.year}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {new Date(driver.profiles.created_at).toLocaleDateString('ar-SA')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedDriver(driver);
                                      toast.info("عرض التفاصيل غير متاح حاليًا");
                                    }}
                                  >
                                    عرض التفاصيل
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">الطلبات المرفوضة</h3>

                {isLoading ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary mb-4" />
                      <p className="text-gray-500">جاري تحميل البيانات...</p>
                    </div>
                  </div>
                ) : filteredRejectedDrivers.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <CheckIcon className="h-12 w-12 text-green-500 mb-4" />
                      <p className="text-gray-500">لا توجد طلبات مرفوضة</p>
                    </div>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 text-xs uppercase">
                            <tr>
                              <th className="px-6 py-3 text-right font-medium text-gray-500">الاسم</th>
                              <th className="px-6 py-3 text-right font-medium text-gray-500">رقم الهوية</th>
                              <th className="px-6 py-3 text-right font-medium text-gray-500">تاريخ التقديم</th>
                              <th className="px-6 py-3 text-right font-medium text-gray-500">سبب الرفض</th>
                              <th className="px-6 py-3 text-right font-medium text-gray-500">الإجراءات</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredRejectedDrivers.map(driver => (
                              <tr key={driver.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {driver.profiles.first_name} {driver.profiles.last_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{driver.national_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {new Date(driver.profiles.created_at).toLocaleDateString('ar-SA')}
                                </td>
                                <td className="px-6 py-4">{driver.rejection_reason || "غير محدد"}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => {
                                      setSelectedDriver(driver);
                                      toast.info("عرض التفاصيل غير متاح حاليًا");
                                    }}
                                  >
                                    عرض التفاصيل
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفض طلب السائق</DialogTitle>
            <DialogDescription>
              يرجى توضيح سبب رفض طلب السائق {selectedDriver && `${selectedDriver.profiles.first_name} ${selectedDriver.profiles.last_name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="rejectionReason" className="text-sm font-medium">سبب الرفض</label>
              <textarea
                id="rejectionReason"
                className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md"
                placeholder="يرجى كتابة سبب الرفض هنا..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>إلغاء</Button>
            <Button
              variant="destructive"
              onClick={handleRejectDriver}
              disabled={!rejectionReason.trim()}
            >
              رفض الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>عرض الوثيقة</DialogTitle>
          </DialogHeader>
          <div className="min-h-[400px] flex items-center justify-center bg-gray-100 rounded-md">
            <div className="text-center">
              <p className="text-gray-500 mb-4">
                هذه الوثيقة مخزنة في مسار: {viewDocumentUrl || 'غير متوفر'}
              </p>
              <p className="text-sm text-gray-400">
                ملاحظة: الملفات الفعلية غير مرفوعة حاليًا بسبب قيود واجهة برمجة التطبيقات
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setDocumentDialogOpen(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const DriverVerification = () => {
  return (
    <LanguageProvider>
      <DriverVerificationContent />
    </LanguageProvider>
  );
};

export default DriverVerification;
