
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { LogOutIcon, SearchIcon, Ban, AlertCircle, MessageSquare, User } from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  ordersCount: number;
  status: 'active' | 'suspended' | 'banned';
}

const CustomersContent = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState('');

  // Fetch customers data - in a real app, this would be from an API
  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      const mockCustomers: Customer[] = [
        {
          id: '1',
          name: 'محمد أحمد',
          email: 'mohammed@example.com',
          phone: '0512345678',
          registrationDate: '2025-01-15',
          ordersCount: 12,
          status: 'active',
        },
        {
          id: '2',
          name: 'فاطمة علي',
          email: 'fatima@example.com',
          phone: '0523456789',
          registrationDate: '2025-02-20',
          ordersCount: 8,
          status: 'active',
        },
        {
          id: '3',
          name: 'عبدالله محمد',
          email: 'abdullah@example.com',
          phone: '0534567890',
          registrationDate: '2025-03-05',
          ordersCount: 5,
          status: 'suspended',
        },
        {
          id: '4',
          name: 'نورة خالد',
          email: 'noura@example.com',
          phone: '0545678901',
          registrationDate: '2025-03-15',
          ordersCount: 3,
          status: 'active',
        },
        {
          id: '5',
          name: 'سعود فهد',
          email: 'saud@example.com',
          phone: '0556789012',
          registrationDate: '2025-03-25',
          ordersCount: 0,
          status: 'banned',
        },
      ];
      setCustomers(mockCustomers);
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

  const handleSuspendCustomer = () => {
    if (!selectedCustomer) return;
    
    // In a real app, this would call an API
    toast.success(`تم تعليق حساب العميل ${selectedCustomer.name} بنجاح`);
    
    // Update local state
    setCustomers(prev => 
      prev.map(customer => 
        customer.id === selectedCustomer.id 
          ? { ...customer, status: 'suspended' as const } 
          : customer
      )
    );
    
    setSuspendDialogOpen(false);
    setSuspensionReason('');
    setSelectedCustomer(null);
  };

  const handleBanCustomer = () => {
    if (!selectedCustomer) return;
    
    // In a real app, this would call an API
    toast.success(`تم حظر حساب العميل ${selectedCustomer.name} بنجاح`);
    
    // Update local state
    setCustomers(prev => 
      prev.map(customer => 
        customer.id === selectedCustomer.id 
          ? { ...customer, status: 'banned' as const } 
          : customer
      )
    );
    
    setBanDialogOpen(false);
    setBanReason('');
    setSelectedCustomer(null);
  };

  const handleSendMessage = () => {
    if (!selectedCustomer || !messageText.trim()) return;
    
    // In a real app, this would call an API to send a message
    toast.success(`تم إرسال الرسالة إلى العميل ${selectedCustomer.name} بنجاح`);
    
    setMessageDialogOpen(false);
    setMessageText('');
    setSelectedCustomer(null);
  };

  const handleActivateCustomer = (customer: Customer) => {
    // In a real app, this would call an API
    toast.success(`تم تفعيل حساب العميل ${customer.name} بنجاح`);
    
    // Update local state
    setCustomers(prev => 
      prev.map(c => 
        c.id === customer.id 
          ? { ...c, status: 'active' as const } 
          : c
      )
    );
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  const activeCustomers = filteredCustomers.filter(customer => customer.status === 'active');
  const suspendedCustomers = filteredCustomers.filter(customer => customer.status === 'suspended');
  const bannedCustomers = filteredCustomers.filter(customer => customer.status === 'banned');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">نشط</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-500">معلق</Badge>;
      case 'banned':
        return <Badge className="bg-red-500">محظور</Badge>;
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
            <h1 className="text-xl font-bold text-gray-900">إدارة العملاء</h1>
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
                  placeholder="ابحث باسم العميل أو البريد الإلكتروني أو رقم الهاتف" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow mb-6 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">العملاء النشطين</p>
                      <p className="text-xl font-bold">{activeCustomers.length}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <User className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">الحسابات المعلقة</p>
                      <p className="text-xl font-bold">{suspendedCustomers.length}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <AlertCircle className="h-6 w-6 text-yellow-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">الحسابات المحظورة</p>
                      <p className="text-xl font-bold">{bannedCustomers.length}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <Ban className="h-6 w-6 text-red-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full grid grid-cols-4 mb-6">
                <TabsTrigger value="all">جميع العملاء</TabsTrigger>
                <TabsTrigger value="active">النشطين</TabsTrigger>
                <TabsTrigger value="suspended">المعلقين</TabsTrigger>
                <TabsTrigger value="banned">المحظورين</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <CustomersList 
                  customers={filteredCustomers} 
                  onSuspend={(customer) => {
                    setSelectedCustomer(customer);
                    setSuspendDialogOpen(true);
                  }}
                  onBan={(customer) => {
                    setSelectedCustomer(customer);
                    setBanDialogOpen(true);
                  }}
                  onMessage={(customer) => {
                    setSelectedCustomer(customer);
                    setMessageDialogOpen(true);
                  }}
                  onActivate={handleActivateCustomer}
                  getStatusBadge={getStatusBadge}
                />
              </TabsContent>
              
              <TabsContent value="active">
                <CustomersList 
                  customers={activeCustomers} 
                  onSuspend={(customer) => {
                    setSelectedCustomer(customer);
                    setSuspendDialogOpen(true);
                  }}
                  onBan={(customer) => {
                    setSelectedCustomer(customer);
                    setBanDialogOpen(true);
                  }}
                  onMessage={(customer) => {
                    setSelectedCustomer(customer);
                    setMessageDialogOpen(true);
                  }}
                  onActivate={handleActivateCustomer}
                  getStatusBadge={getStatusBadge}
                />
              </TabsContent>
              
              <TabsContent value="suspended">
                <CustomersList 
                  customers={suspendedCustomers} 
                  onSuspend={(customer) => {
                    setSelectedCustomer(customer);
                    setSuspendDialogOpen(true);
                  }}
                  onBan={(customer) => {
                    setSelectedCustomer(customer);
                    setBanDialogOpen(true);
                  }}
                  onMessage={(customer) => {
                    setSelectedCustomer(customer);
                    setMessageDialogOpen(true);
                  }}
                  onActivate={handleActivateCustomer}
                  getStatusBadge={getStatusBadge}
                />
              </TabsContent>
              
              <TabsContent value="banned">
                <CustomersList 
                  customers={bannedCustomers} 
                  onSuspend={(customer) => {
                    setSelectedCustomer(customer);
                    setSuspendDialogOpen(true);
                  }}
                  onBan={(customer) => {
                    setSelectedCustomer(customer);
                    setBanDialogOpen(true);
                  }}
                  onMessage={(customer) => {
                    setSelectedCustomer(customer);
                    setMessageDialogOpen(true);
                  }}
                  onActivate={handleActivateCustomer}
                  getStatusBadge={getStatusBadge}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      {/* Suspension Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعليق حساب العميل</DialogTitle>
            <DialogDescription>
              يرجى توضيح سبب تعليق حساب العميل {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="suspensionReason" className="text-sm font-medium">سبب التعليق</label>
              <textarea 
                id="suspensionReason"
                className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md"
                placeholder="يرجى كتابة سبب تعليق الحساب هنا..."
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>إلغاء</Button>
            <Button 
              variant="warning" 
              className="bg-yellow-500 hover:bg-yellow-600"
              onClick={handleSuspendCustomer}
              disabled={!suspensionReason.trim()}
            >
              تعليق الحساب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حظر حساب العميل</DialogTitle>
            <DialogDescription>
              يرجى توضيح سبب حظر حساب العميل {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="banReason" className="text-sm font-medium">سبب الحظر</label>
              <textarea 
                id="banReason"
                className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md"
                placeholder="يرجى كتابة سبب حظر الحساب هنا..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>إلغاء</Button>
            <Button 
              variant="destructive" 
              onClick={handleBanCustomer}
              disabled={!banReason.trim()}
            >
              حظر الحساب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إرسال رسالة للعميل</DialogTitle>
            <DialogDescription>
              سيتم إرسال هذه الرسالة إلى العميل {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="messageText" className="text-sm font-medium">نص الرسالة</label>
              <textarea 
                id="messageText"
                className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md"
                placeholder="اكتب رسالتك هنا..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>إلغاء</Button>
            <Button 
              variant="default" 
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
            >
              إرسال الرسالة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface CustomersListProps {
  customers: Customer[];
  onSuspend: (customer: Customer) => void;
  onBan: (customer: Customer) => void;
  onMessage: (customer: Customer) => void;
  onActivate: (customer: Customer) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

const CustomersList = ({ 
  customers, 
  onSuspend, 
  onBan, 
  onMessage, 
  onActivate,
  getStatusBadge 
}: CustomersListProps) => {
  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="flex flex-col items-center justify-center">
          <User className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">لا يوجد عملاء في هذه الفئة</p>
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
                <th className="px-6 py-3 text-right font-medium text-gray-500">اسم العميل</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">البريد الإلكتروني</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">رقم الجوال</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">تاريخ التسجيل</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">عدد الطلبات</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">الحالة</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{customer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.registrationDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.ordersCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(customer.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2 rtl:space-x-reverse justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onMessage(customer)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      
                      {customer.status === 'active' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                            onClick={() => onSuspend(customer)}
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-red-500 text-red-500 hover:bg-red-50"
                            onClick={() => onBan(customer)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {(customer.status === 'suspended' || customer.status === 'banned') && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-green-500 text-green-500 hover:bg-green-50"
                          onClick={() => onActivate(customer)}
                        >
                          تفعيل
                        </Button>
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

// Wrap the component with LanguageProvider
const Customers = () => {
  return (
    <LanguageProvider>
      <CustomersContent />
    </LanguageProvider>
  );
};

export default Customers;
