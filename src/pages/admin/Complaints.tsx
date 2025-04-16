
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { LogOutIcon, SearchIcon, AlertTriangle, MessageCircle, CheckCircle, XCircle, Tag, User } from 'lucide-react';
import { toast } from 'sonner';

interface Complaint {
  id: string;
  refNumber: string;
  createdAt: string;
  subject: string;
  description: string;
  status: 'new' | 'inProgress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: 'customer' | 'driver';
  };
  relatedOrderId?: string;
  assignedTo?: string;
  responses?: {
    id: string;
    text: string;
    createdAt: string;
    isAdmin: boolean;
  }[];
}

const ComplaintsContent = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [newResponseText, setNewResponseText] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterUserType, setFilterUserType] = useState<string>('all');

  // Fetch complaints data - in a real app, this would be from an API
  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      const mockComplaints: Complaint[] = [
        {
          id: '1',
          refNumber: 'SC-20250416-001',
          createdAt: '2025-04-16 09:30',
          subject: 'تأخير في التوصيل',
          description: 'السائق تأخر في توصيل الطلب أكثر من ساعتين عن الموعد المتفق عليه.',
          status: 'new',
          priority: 'medium',
          user: {
            id: '101',
            name: 'محمد سعيد',
            email: 'mohamed@example.com',
            phone: '0512345678',
            type: 'customer'
          },
          relatedOrderId: 'ORD-987654',
          responses: []
        },
        {
          id: '2',
          refNumber: 'SC-20250415-001',
          createdAt: '2025-04-15 14:45',
          subject: 'سلوك غير لائق من العميل',
          description: 'العميل تعامل بطريقة غير لائقة وألفاظ غير محترمة أثناء عملية التسليم.',
          status: 'inProgress',
          priority: 'high',
          user: {
            id: '102',
            name: 'أحمد العتيبي',
            email: 'ahmed@example.com',
            phone: '0523456789',
            type: 'driver'
          },
          relatedOrderId: 'ORD-876543',
          assignedTo: 'سارة المطيري',
          responses: [
            {
              id: 'r1',
              text: 'تم التواصل مع العميل وسيتم متابعة الموضوع.',
              createdAt: '2025-04-15 15:20',
              isAdmin: true
            }
          ]
        },
        {
          id: '3',
          refNumber: 'SC-20250414-002',
          createdAt: '2025-04-14 16:30',
          subject: 'مشكلة في تطبيق الهاتف',
          description: 'التطبيق يتوقف بشكل متكرر عند محاولة إضافة عنوان جديد.',
          status: 'resolved',
          priority: 'low',
          user: {
            id: '103',
            name: 'فاطمة الزهراني',
            email: 'fatima@example.com',
            phone: '0534567890',
            type: 'customer'
          },
          responses: [
            {
              id: 'r2',
              text: 'هل يمكنك توضيح نوع الجهاز وإصدار النظام الذي تستخدمه؟',
              createdAt: '2025-04-14 17:00',
              isAdmin: true
            },
            {
              id: 'r3',
              text: 'أستخدم آيفون 14 برو مع آخر تحديث iOS.',
              createdAt: '2025-04-14 17:15',
              isAdmin: false
            },
            {
              id: 'r4',
              text: 'تم إصلاح المشكلة مع التحديث الجديد للتطبيق، يرجى تحديث التطبيق وإعادة المحاولة.',
              createdAt: '2025-04-14 17:45',
              isAdmin: true
            }
          ]
        },
        {
          id: '4',
          refNumber: 'SC-20250414-001',
          createdAt: '2025-04-14 11:20',
          subject: 'تضرر البضاعة أثناء النقل',
          description: 'استلمت الطرد وكان متضرراً من الداخل، الجهاز الإلكتروني لا يعمل.',
          status: 'inProgress',
          priority: 'high',
          user: {
            id: '104',
            name: 'خالد الشهري',
            email: 'khalid@example.com',
            phone: '0545678901',
            type: 'customer'
          },
          relatedOrderId: 'ORD-765432',
          assignedTo: 'محمد الحربي',
          responses: [
            {
              id: 'r5',
              text: 'هل يمكن إرسال صور للطرد المتضرر والمحتويات التالفة؟',
              createdAt: '2025-04-14 11:45',
              isAdmin: true
            },
            {
              id: 'r6',
              text: 'تم إرسال الصور عبر البريد الإلكتروني.',
              createdAt: '2025-04-14 12:10',
              isAdmin: false
            }
          ]
        },
        {
          id: '5',
          refNumber: 'SC-20250413-001',
          createdAt: '2025-04-13 13:15',
          subject: 'عدم وصول إشعارات التطبيق',
          description: 'لا أتلقى إشعارات عند وصول الطلب أو تحديث حالته.',
          status: 'resolved',
          priority: 'medium',
          user: {
            id: '105',
            name: 'نورة السعدون',
            email: 'noura@example.com',
            phone: '0556789012',
            type: 'customer'
          },
          responses: [
            {
              id: 'r7',
              text: 'يرجى التأكد من تفعيل الإشعارات في إعدادات الجهاز للتطبيق.',
              createdAt: '2025-04-13 13:40',
              isAdmin: true
            },
            {
              id: 'r8',
              text: 'تم التحقق والإشعارات مفعلة ولكن لا زالت المشكلة موجودة.',
              createdAt: '2025-04-13 14:05',
              isAdmin: false
            },
            {
              id: 'r9',
              text: 'تم إصلاح الخلل الفني، يرجى تسجيل الخروج وإعادة تسجيل الدخول.',
              createdAt: '2025-04-13 15:30',
              isAdmin: true
            },
            {
              id: 'r10',
              text: 'تم حل المشكلة، شكراً لكم.',
              createdAt: '2025-04-13 15:45',
              isAdmin: false
            }
          ]
        }
      ];
      setComplaints(mockComplaints);
    }, 500);
  }, []);

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

  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setDetailsDialogOpen(true);
  };

  const handleSendResponse = () => {
    if (!selectedComplaint || !newResponseText.trim()) return;
    
    // In a real app, this would call an API
    const newResponse = {
      id: `r${Date.now()}`,
      text: newResponseText,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isAdmin: true
    };
    
    // Update local state
    const updatedComplaints = complaints.map(complaint => {
      if (complaint.id === selectedComplaint.id) {
        const updatedComplaint = {
          ...complaint,
          status: complaint.status === 'new' ? 'inProgress' as const : complaint.status,
          responses: [...(complaint.responses || []), newResponse]
        };
        setSelectedComplaint(updatedComplaint);
        return updatedComplaint;
      }
      return complaint;
    });
    
    setComplaints(updatedComplaints);
    setNewResponseText('');
    toast.success('تم إرسال الرد بنجاح');
  };

  const handleResolveComplaint = () => {
    if (!selectedComplaint) return;
    
    // Update local state
    const updatedComplaints = complaints.map(complaint => {
      if (complaint.id === selectedComplaint.id) {
        const updatedComplaint = {
          ...complaint,
          status: 'resolved' as const
        };
        setSelectedComplaint(updatedComplaint);
        return updatedComplaint;
      }
      return complaint;
    });
    
    setComplaints(updatedComplaints);
    toast.success(`تم حل الشكوى ${selectedComplaint.refNumber} بنجاح`);
  };

  const handleAssignComplaint = () => {
    // In a real app, this would open a dialog to select staff member
    if (!selectedComplaint) return;
    
    // For demo purposes, just assign to a fixed name
    const updatedComplaints = complaints.map(complaint => {
      if (complaint.id === selectedComplaint.id) {
        const updatedComplaint = {
          ...complaint,
          assignedTo: 'محمد العمري'
        };
        setSelectedComplaint(updatedComplaint);
        return updatedComplaint;
      }
      return complaint;
    });
    
    setComplaints(updatedComplaints);
    toast.success('تم تعيين الشكوى للموظف محمد العمري');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500">جديدة</Badge>;
      case 'inProgress':
        return <Badge className="bg-yellow-500">قيد المعالجة</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">تم الحل</Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge className="bg-gray-500">منخفضة</Badge>;
      case 'medium':
        return <Badge className="bg-blue-500">متوسطة</Badge>;
      case 'high':
        return <Badge className="bg-red-500">عالية</Badge>;
      default:
        return null;
    }
  };

  const getUserTypeBadge = (type: string) => {
    switch (type) {
      case 'customer':
        return <Badge className="bg-purple-500">عميل</Badge>;
      case 'driver':
        return <Badge className="bg-green-500">سائق</Badge>;
      default:
        return null;
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    // Filter by search query
    const matchesSearch = 
      complaint.refNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
      complaint.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.user.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by priority if selected
    const matchesPriority = filterPriority === 'all' || complaint.priority === filterPriority;

    // Filter by user type if selected
    const matchesUserType = filterUserType === 'all' || complaint.user.type === filterUserType;
    
    return matchesSearch && matchesPriority && matchesUserType;
  });

  const newComplaints = filteredComplaints.filter(complaint => complaint.status === 'new');
  const inProgressComplaints = filteredComplaints.filter(complaint => complaint.status === 'inProgress');
  const resolvedComplaints = filteredComplaints.filter(complaint => complaint.status === 'resolved');

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
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  className="pl-10 pr-4" 
                  placeholder="ابحث برقم الشكوى أو الموضوع أو اسم المستخدم" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3">
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="الأولوية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأولويات</SelectItem>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterUserType} onValueChange={setFilterUserType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="نوع المستخدم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="customer">عميل</SelectItem>
                    <SelectItem value="driver">سائق</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow mb-6 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">شكاوى جديدة</p>
                      <p className="text-xl font-bold">{newComplaints.length}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <AlertTriangle className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">قيد المعالجة</p>
                      <p className="text-xl font-bold">{inProgressComplaints.length}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <MessageCircle className="h-6 w-6 text-yellow-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">تم حلها</p>
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
                <TabsTrigger value="new">الجديدة</TabsTrigger>
                <TabsTrigger value="inProgress">قيد المعالجة</TabsTrigger>
                <TabsTrigger value="resolved">المحلولة</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <ComplaintsTable 
                  complaints={filteredComplaints} 
                  onViewDetails={handleViewDetails} 
                  getStatusBadge={getStatusBadge} 
                  getPriorityBadge={getPriorityBadge}
                  getUserTypeBadge={getUserTypeBadge}
                />
              </TabsContent>
              
              <TabsContent value="new">
                <ComplaintsTable 
                  complaints={newComplaints} 
                  onViewDetails={handleViewDetails} 
                  getStatusBadge={getStatusBadge} 
                  getPriorityBadge={getPriorityBadge}
                  getUserTypeBadge={getUserTypeBadge}
                />
              </TabsContent>
              
              <TabsContent value="inProgress">
                <ComplaintsTable 
                  complaints={inProgressComplaints} 
                  onViewDetails={handleViewDetails} 
                  getStatusBadge={getStatusBadge} 
                  getPriorityBadge={getPriorityBadge}
                  getUserTypeBadge={getUserTypeBadge}
                />
              </TabsContent>
              
              <TabsContent value="resolved">
                <ComplaintsTable 
                  complaints={resolvedComplaints} 
                  onViewDetails={handleViewDetails} 
                  getStatusBadge={getStatusBadge} 
                  getPriorityBadge={getPriorityBadge}
                  getUserTypeBadge={getUserTypeBadge}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      {/* Complaint Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              الشكوى #{selectedComplaint?.refNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedComplaint && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">معلومات الشكوى</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">رقم الشكوى:</p>
                      <p className="font-medium">{selectedComplaint.refNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">تاريخ الإنشاء:</p>
                      <p className="font-medium">{selectedComplaint.createdAt}</p>
                    </div>
                    <div className="flex gap-2">
                      <div>
                        <p className="text-sm text-gray-500">الحالة:</p>
                        <div>{getStatusBadge(selectedComplaint.status)}</div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">الأولوية:</p>
                        <div>{getPriorityBadge(selectedComplaint.priority)}</div>
                      </div>
                    </div>
                    {selectedComplaint.assignedTo && (
                      <div>
                        <p className="text-sm text-gray-500">تم التعيين إلى:</p>
                        <p className="font-medium">{selectedComplaint.assignedTo}</p>
                      </div>
                    )}
                    {selectedComplaint.relatedOrderId && (
                      <div>
                        <p className="text-sm text-gray-500">الطلب المرتبط:</p>
                        <p className="font-medium">{selectedComplaint.relatedOrderId}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">معلومات المستخدم</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500">المستخدم:</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{selectedComplaint.user.name}</p>
                        {getUserTypeBadge(selectedComplaint.user.type)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">البريد الإلكتروني:</p>
                      <p className="font-medium">{selectedComplaint.user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">رقم الهاتف:</p>
                      <p className="font-medium">{selectedComplaint.user.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">تفاصيل الشكوى</h4>
                <div className="p-4 bg-gray-50 rounded-md">
                  <h5 className="font-semibold mb-2">{selectedComplaint.subject}</h5>
                  <p>{selectedComplaint.description}</p>
                </div>
              </div>
              
              {selectedComplaint.responses && selectedComplaint.responses.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">سجل المراسلات</h4>
                  <div className="space-y-3">
                    {selectedComplaint.responses.map(response => (
                      <div 
                        key={response.id} 
                        className={`p-3 rounded-md ${
                          response.isAdmin 
                            ? 'bg-blue-50 border-r-4 border-blue-500' 
                            : 'bg-gray-50 border-r-4 border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                          <span>{response.isAdmin ? 'الإدارة' : selectedComplaint.user.name}</span>
                          <span>{response.createdAt}</span>
                        </div>
                        <p>{response.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedComplaint.status !== 'resolved' && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">إرسال رد</h4>
                  <textarea 
                    className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md"
                    placeholder="اكتب ردك هنا..."
                    value={newResponseText}
                    onChange={(e) => setNewResponseText(e.target.value)}
                  />
                </div>
              )}
              
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  {!selectedComplaint.assignedTo && selectedComplaint.status !== 'resolved' && (
                    <Button
                      variant="outline"
                      onClick={handleAssignComplaint}
                      className="gap-2"
                    >
                      <User className="h-4 w-4" />
                      تعيين لموظف
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {selectedComplaint.status !== 'resolved' && (
                    <>
                      <Button 
                        variant="outline"
                        className="gap-2 border-green-500 text-green-500 hover:bg-green-50"
                        onClick={handleResolveComplaint}
                      >
                        <CheckCircle className="h-4 w-4" />
                        تحديد كمحلولة
                      </Button>
                      
                      <Button 
                        variant="default"
                        disabled={!newResponseText.trim()}
                        onClick={handleSendResponse}
                      >
                        إرسال الرد
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ComplaintsTableProps {
  complaints: Complaint[];
  onViewDetails: (complaint: Complaint) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  getPriorityBadge: (priority: string) => React.ReactNode;
  getUserTypeBadge: (type: string) => React.ReactNode;
}

const ComplaintsTable = ({ 
  complaints, 
  onViewDetails,
  getStatusBadge,
  getPriorityBadge,
  getUserTypeBadge
}: ComplaintsTableProps) => {
  if (complaints.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="flex flex-col items-center justify-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
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
                <th className="px-6 py-3 text-right font-medium text-gray-500">التاريخ</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">الموضوع</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">المستخدم</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">نوع المستخدم</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">الأولوية</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">الحالة</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {complaints.map(complaint => (
                <tr key={complaint.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{complaint.refNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{complaint.createdAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-[200px] truncate" title={complaint.subject}>
                    {complaint.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{complaint.user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getUserTypeBadge(complaint.user.type)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getPriorityBadge(complaint.priority)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(complaint.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewDetails(complaint)}
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
  );
};

// Wrap the component with LanguageProvider
const Complaints = () => {
  return (
    <LanguageProvider>
      <ComplaintsContent />
    </LanguageProvider>
  );
};

export default Complaints;
