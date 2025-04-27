
import { useState } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MessageSquare, HelpCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DriverSupportContent = () => {
  const { t } = useLanguage();
  const [issueType, setIssueType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('تم إرسال طلبك بنجاح. سيتم التواصل معك قريبًا.');
      setIssueType('');
      setDescription('');
      setIsSubmitting(false);
    }, 1500);
  };

  const commonIssues = [
    {
      id: 1,
      title: 'كيفية تغيير حالة التوفر؟',
      answer: 'يمكنك تغيير حالة توفرك من خلال الانتقال إلى صفحة الطلبات ثم النقر على زر الحالة في الأعلى.'
    },
    {
      id: 2,
      title: 'لا يمكنني رؤية المدفوعات الخاصة بي',
      answer: 'تظهر المدفوعات في صفحة الأرباح بعد إتمام توصيل الطلبات بنجاح. إذا لم تظهر المدفوعات، تواصل مع الدعم الفني.'
    },
    {
      id: 3,
      title: 'كيف يتم احتساب العمولة؟',
      answer: 'تبلغ عمولة المنصة 15% من قيمة التوصيل. يتم خصمها تلقائياً من مبلغ كل طلب يتم إكماله.'
    },
    {
      id: 4,
      title: 'الإبلاغ عن عميل',
      answer: 'لإبلاغ عن عميل، توجه لصفحة الطلب المرتبط بالعميل واضغط على زر "الإبلاغ" واكتب سبب البلاغ.'
    },
    {
      id: 5,
      title: 'تعذر الوصول إلى موقع التسليم',
      answer: 'إذا واجهت صعوبة في الوصول لموقع التسليم، يمكنك التواصل مع العميل مباشرة أو تحديث حالة الطلب وذكر المشكلة.'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">الدعم والمساعدة</h1>
              <SidebarTrigger />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="support" className="w-full">
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="support">طلب مساعدة</TabsTrigger>
                <TabsTrigger value="faq">الأسئلة الشائعة</TabsTrigger>
              </TabsList>
              
              <TabsContent value="support" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>تواصل مع الدعم</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="issue-type" className="block text-sm font-medium text-gray-700 mb-1">
                          نوع المشكلة
                        </label>
                        <Select 
                          value={issueType} 
                          onValueChange={setIssueType}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="اختر نوع المشكلة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="account">مشكلة في الحساب</SelectItem>
                            <SelectItem value="payment">مشكلة في المدفوعات</SelectItem>
                            <SelectItem value="order">مشكلة في الطلب</SelectItem>
                            <SelectItem value="app">مشكلة في التطبيق</SelectItem>
                            <SelectItem value="other">أخرى</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                          وصف المشكلة
                        </label>
                        <Textarea 
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="اشرح المشكلة التي تواجهها بالتفصيل..."
                          className="h-32"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="upload" className="block text-sm font-medium text-gray-700 mb-1">
                          إرفاق ملف (اختياري)
                        </label>
                        <Input 
                          id="upload"
                          type="file" 
                          accept="image/*, application/pdf"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="bg-safedrop-primary hover:bg-safedrop-primary/90"
                          disabled={!issueType || !description || isSubmitting}
                        >
                          {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <HelpCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">اتصل بنا مباشرة</h3>
                          <p className="text-sm text-gray-500">للمساعدة الفورية</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm">رقم الهاتف: <span className="font-medium">920001234</span></p>
                        <p className="text-sm">من 8 صباحاً - 12 مساءاً</p>
                        <Button 
                          variant="outline" 
                          className="w-full mt-2"
                          onClick={() => window.open('tel:920001234')}
                        >
                          اتصل الآن
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-green-100 p-3 rounded-full">
                          <FileText className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">دليل السائق</h3>
                          <p className="text-sm text-gray-500">أدلة إرشادية مفصلة</p>
                        </div>
                      </div>
                      <p className="text-sm mb-2">دليل شامل يساعدك على فهم كيفية استخدام المنصة وحل المشكلات الشائعة</p>
                      <Button variant="outline" className="w-full">
                        تحميل الدليل
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="faq">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" />
                      <span>الأسئلة الشائعة</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {commonIssues.map((issue) => (
                        <div key={issue.id} className="border-b border-gray-100 pb-4 last:border-none last:pb-0">
                          <h3 className="font-medium text-lg mb-1">{issue.title}</h3>
                          <p className="text-gray-600">{issue.answer}</p>
                        </div>
                      ))}
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

const DriverSupport = () => {
  return (
    <LanguageProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <DriverSupportContent />
        </div>
      </SidebarProvider>
    </LanguageProvider>
  );
};

export default DriverSupport;
