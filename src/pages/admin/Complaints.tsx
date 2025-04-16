
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { LogOutIcon, SearchIcon, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Complaint {
  id: string;
  userId: string;
  userName: string;
  userType: 'customer' | 'driver';
  subject: string;
  description: string;
  orderId?: string;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'resolved';
}

const useComplaints = (status?: string) => {
  return useQuery({
    queryKey: ['complaints', status],
    queryFn: async () => {
      try {
        // In a real implementation, this would fetch data from Supabase
        // const query = supabase
        //   .from('complaints')
        //   .select('*, profiles:user_id(first_name, last_name, user_type)')
        //   .order('created_at', { ascending: false });
        
        // if (status) {
        //   query.eq('status', status);
        // }
        
        // const { data, error } = await query;
        
        // if (error) throw error;
        
        // Return the processed complaints
        // return data.map(complaint => ({
        //   id: complaint.id,
        //   userId: complaint.user_id,
        //   userName: `${complaint.profiles.first_name} ${complaint.profiles.last_name}`,
        //   userType: complaint.profiles.user_type,
        //   subject: complaint.subject,
        //   description: complaint.description,
        //   orderId: complaint.order_id,
        //   createdAt: new Date(complaint.created_at).toLocaleDateString('ar-SA'),
        //   status: complaint.status
        // }));
        
        // Return an empty array for now
        return [] as Complaint[];
        
      } catch (error) {
        console.error('Error fetching complaints:', error);
        return [] as Complaint[];
      }
    }
  });
};

const ComplaintsContent = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: complaints = [], isLoading } = useComplaints();
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [complaintDetailsOpen, setComplaintDetailsOpen] = useState(false);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');

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

  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setComplaintDetailsOpen(true);
  };

  const handleRespond = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResponseDialogOpen(true);
  };

  const handleSubmitResponse = () => {
    if (!selectedComplaint || !responseText.trim()) return;

    // In a real implementation, this would send the response and update the complaint status
    // const updateComplaint = async () => {
    //   try {
    //     // Add the response to the complaint responses table
    //     await supabase
    //       .from('complaint_responses')
    //       .insert([{
    //         complaint_id: selectedComplaint.id,
    //         response: responseText,
    //         admin_id: adminId // This would be the logged-in admin's ID
    //       }]);
    //     
    //     // Update the complaint status to in_progress if it was pending
    //     if (selectedComplaint.status === 'pending') {
    //       await supabase
    //         .from('complaints')
    //         .update({ status: 'in_progress' })
    //         .eq('id', selectedComplaint.id);
    //     }
    //     
    //     toast.success('تم إرسال الرد بنجاح');
    //   } catch (error) {
    //     console.error('Error submitting response:', error);
    //     toast.error('حدث خطأ أثناء إرسال الرد');
    //   }
    // };
    // 
    // updateComplaint();

    toast.success('تم إرسال الرد بنجاح');
    setResponseDialogOpen(false);
    setResponseText('');
    setSelectedComplaint(null);
  };

  const handleResolveComplaint = (complaint: Complaint) => {
    // In a real implementation, this would update the complaint status
    // const resolveComplaint = async () => {
    //   try {
    //     await supabase
    //       .from('complaints')
    //       .update({ status: 'resolved' })
    //       .eq('id', complaint.id);
    //     
    //     toast.success('تم حل الشكوى بنجاح');
    //   } catch (error) {
    //     console.error('Error resolving complaint:', error);
    //     toast.error('حدث خطأ أثناء حل الشكوى');
    //   }
    // };
    // 
    // resolveComplaint();

    toast.success('تم حل الشكوى بنجاح');
  };

  const filteredComplaints = searchQuery
    ? complaints.filter(
        complaint =>
          complaint.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          complaint.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          complaint.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (complaint.orderId && complaint.orderId.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : complaints;

  const pendingComplaints = complaints.filter(complaint => complaint.status === 'pending');
  const inProgressComplaints = complaints.filter(complaint => complaint.status === 'in_progress');
  const resolvedComplaints = complaints.filter(complaint => complaint.status === 'resolved');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">قيد الانتظار</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">جاري المعالجة</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">تم الحل</Badge>;
      default:
        return null;
    }
  };

  const getUserTypeBadge = (userType: string) => {
    switch (userType) {
      case 'customer':
        return <Badge className="bg-purple-500">عميل</Badge>;
      case 'driver':
        return <Badge className="bg-indigo-500">سائق</Badge>;
      default:
        return null;
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
            <h1 className="text-xl font-bold text-gray-900">الشكاوى والدعم</h1>
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
                  placeholder="ابحث برقم الشكوى أو اسم المستخدم أو الموضوع" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow mb-6 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">شكاوى قيد الانتظار</p>
                      <p className="text-xl font-bold">{pendingComplaints.length}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <AlertCircle className="h-6 w-6 text-yellow-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">شكاوى جاري معالجتها</p>
                      <p className="text-xl font-bold">{inProgressComplaints.length}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <MessageSquare className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">شكاوى تم حلها</p>
                      <p className="text-xl font-bold">{resolvedComplaints.length}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full grid grid-cols-4 mb-6">
                <TabsTrigger value="all">جميع الشكاوى</TabsTrigger>
                <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
                <TabsTrigger value="in_progress">جاري المعالجة</TabsTrigger>
                <TabsTrigger value="resolved">تم الحل</TabsTrigger>
              </TabsList>
              
              {isLoading ? (
                <div className="flex justify-center items-center p-12">
                  <p>جاري تحميل البيانات...</p>
                </div>
              ) : (
                <>
                  <TabsContent value="all">
                    <ComplaintsTable
                      complaints={filteredComplaints}
                      getStatusBadge={getStatusBadge}
                      getUserTypeBadge={getUserTypeBadge}
                      onViewDetails={handleViewDetails}
                      onRespond={handleRespond}
                      onResolve={handleResolveComplaint}
                    />
                  </TabsContent>
                  
                  <TabsContent value="pending">
                    <ComplaintsTable
                      complaints={pendingComplaints.filter(complaint =>
                        searchQuery
                          ? complaint.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            complaint.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            complaint.subject.toLowerCase().includes(searchQuery.toLowerCase())
                          : true
                      )}
                      getStatusBadge={getStatusBadge}
                      getUserTypeBadge={getUserTypeBadge}
                      onViewDetails={handleViewDetails}
                      onRespond={handleRespond}
                      onResolve={handleResolveComplaint}
                    />
                  </TabsContent>
                  
                  <TabsContent value="in_progress">
                    <ComplaintsTable
                      complaints={inProgressComplaints.filter(complaint =>
                        searchQuery
                          ? complaint.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            complaint.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            complaint.subject.toLowerCase().includes(searchQuery.toLowerCase())
                          : true
                      )}
                      getStatusBadge={getStatusBadge}
                      getUserTypeBadge={getUserTypeBadge}
                      onViewDetails={handleViewDetails}
                      onRespond={handleRespond}
                      onResolve={handleResolveComplaint}
                    />
                  </TabsContent>
                  
                  <TabsContent value="resolved">
                    <ComplaintsTable
                      complaints={resolvedComplaints.filter(complaint =>
                        searchQuery
                          ? complaint.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            complaint.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            complaint.subject.toLowerCase().includes(searchQuery.toLowerCase())
                          : true
                      )}
                      getStatusBadge={getStatusBadge}
                      getUserTypeBadge={getUserTypeBadge}
                      onViewDetails={handleViewDetails}
                      onRespond={handleRespond}
                      onResolve={handleResolveComplaint}
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </main>
      </div>
      
      {/* Complaint Details Dialog */}
      <Dialog open={complaintDetailsOpen} onOpenChange={setComplaintDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>تفاصيل الشكوى #{selectedComplaint?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">المستخدم:</p>
                  <p className="font-medium">{selectedComplaint.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">نوع المستخدم:</p>
                  <div className="mt-1">{getUserTypeBadge(selectedComplaint.userType)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">تاريخ الشكوى:</p>
                  <p className="font-medium">{selectedComplaint.createdAt}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">حالة الشكوى:</p>
                  <div className="mt-1">{getStatusBadge(selectedComplaint.status)}</div>
                </div>
              </div>
              
              {selectedComplaint.orderId && (
                <div>
                  <p className="text-sm text-gray-500">رقم الطلب المتعلق:</p>
                  <p className="font-medium">#{selectedComplaint.orderId}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500">موضوع الشكوى:</p>
                <p className="font-medium">{selectedComplaint.subject}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">وصف الشكوى:</p>
                <p className="bg-gray-50 p-3 rounded-md mt-1">{selectedComplaint.description}</p>
              </div>
              
              {/* Here you would display previous responses if any */}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setComplaintDetailsOpen(false)}>إغلاق</Button>
            {selectedComplaint && selectedComplaint.status !== 'resolved' && (
              <Button 
                variant="default" 
                onClick={() => {
                  setComplaintDetailsOpen(false);
                  setResponseDialogOpen(true);
                }}
              >
                الرد على الشكوى
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>الرد على الشكوى #{selectedComplaint?.id}</DialogTitle>
            <DialogDescription>
              سيتم إرسال هذا الرد إلى {selectedComplaint?.userName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="responseText" className="text-sm font-medium">نص الرد</label>
              <textarea 
                id="responseText"
                className="w-full min-h-[200px] p-2 border border-gray-300 rounded-md"
                placeholder="اكتب ردك هنا..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>إلغاء</Button>
            <Button 
              variant="default" 
              onClick={handleSubmitResponse}
              disabled={!responseText.trim()}
            >
              إرسال الرد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ComplaintsTableProps {
  complaints: Complaint[];
  getStatusBadge: (status: string) => React.ReactNode;
  getUserTypeBadge: (userType: string) => React.ReactNode;
  onViewDetails: (complaint: Complaint) => void;
  onRespond: (complaint: Complaint) => void;
  onResolve: (complaint: Complaint) => void;
}

const ComplaintsTable = ({ 
  complaints, 
  getStatusBadge, 
  getUserTypeBadge,
  onViewDetails,
  onRespond,
  onResolve
}: ComplaintsTableProps) => {
  if (complaints.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="flex flex-col items-center justify-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">لا توجد شكاوى في هذه الفئة</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-right font-medium text-gray-500">رقم الشكوى</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">المستخدم</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">النوع</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">الموضوع</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">التاريخ</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">الحالة</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {complaints.map(complaint => (
                <tr key={complaint.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">#{complaint.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{complaint.userName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getUserTypeBadge(complaint.userType)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{complaint.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{complaint.createdAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(complaint.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewDetails(complaint)}
                      >
                        عرض
                      </Button>
                      
                      {complaint.status !== 'resolved' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-blue-500 text-blue-500 hover:bg-blue-50"
                            onClick={() => onRespond(complaint)}
                          >
                            رد
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-green-500 text-green-500 hover:bg-green-50"
                            onClick={() => onResolve(complaint)}
                          >
                            حل
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

const Complaints = () => {
  return (
    <LanguageProvider>
      <ComplaintsContent />
    </LanguageProvider>
  );
};

export default Complaints;
