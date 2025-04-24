
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MessageSquare, Loader2, Send, Clock, CheckCircle, XCircle } from 'lucide-react';

const CustomerSupport = () => {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchTickets = async () => {
      try {
        const { data, error } = await supabase
          .from('complaints')
          .select('*, complaint_responses(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setTickets(data || []);
      } catch (error) {
        console.error('Error fetching support tickets:', error);
        toast.error('حدث خطأ أثناء تحميل تذاكر الدعم الفني');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTickets();
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }
    
    if (!subject.trim() || !message.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('complaints')
        .insert({
          subject: subject,
          description: message,
          user_id: user.id,
          status: 'pending'
        })
        .select();
      
      if (error) throw error;
      
      toast.success('تم إرسال طلب الدعم بنجاح');
      setSubject('');
      setMessage('');
      
      // Add the new ticket to the list
      if (data && data.length > 0) {
        setTickets([data[0], ...tickets]);
      }
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      toast.error('حدث خطأ أثناء إرسال طلب الدعم');
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };
  
  const getStatusBadge = (status: string) => {
    const badgeClasses = {
      base: "px-2 py-1 rounded-full text-xs font-medium",
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
      rejected: "bg-red-100 text-red-800"
    };
    
    const statusTranslation = {
      pending: "قيد الانتظار",
      in_progress: "قيد المعالجة",
      resolved: "تم الحل",
      closed: "مغلق",
      rejected: "مرفوض"
    };
    
    const statusIcons = {
      pending: <Clock className="h-3 w-3 mr-1" />,
      in_progress: <Loader2 className="h-3 w-3 mr-1" />,
      resolved: <CheckCircle className="h-3 w-3 mr-1" />,
      closed: <XCircle className="h-3 w-3 mr-1" />,
      rejected: <XCircle className="h-3 w-3 mr-1" />
    };
    
    return (
      <span className={`${badgeClasses.base} ${badgeClasses[status]} flex items-center`}>
        {statusIcons[status]}
        {statusTranslation[status] || status}
      </span>
    );
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">الدعم الفني</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-safedrop-gold" />
              فتح تذكرة جديدة
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="subject" className="block mb-1 font-semibold text-gray-700">الموضوع</label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="عنوان المشكلة"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block mb-1 font-semibold text-gray-700">الرسالة</label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اشرح مشكلتك بالتفصيل"
                  rows={5}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="bg-safedrop-gold hover:bg-safedrop-gold/90 w-full"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    إرسال
                  </>
                )}
              </Button>
            </form>
          </Card>
          
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-xl font-semibold mb-4">تذاكر الدعم الفني</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary"></div>
              </div>
            ) : tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <Card key={ticket.id} className="shadow-sm border p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg">{ticket.subject}</h3>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{formatDate(ticket.created_at)}</p>
                    <p className="text-gray-700 mb-4 p-3 bg-gray-50 rounded">{ticket.description}</p>
                    
                    {ticket.complaint_responses && ticket.complaint_responses.length > 0 ? (
                      <div className="border-t pt-3 mt-3">
                        <h4 className="font-medium mb-2">الردود:</h4>
                        <div className="space-y-3">
                          {ticket.complaint_responses.map((response) => (
                            <div key={response.id} className="bg-blue-50 p-3 rounded">
                              <p className="text-sm text-gray-500 mb-1">{formatDate(response.created_at)}</p>
                              <p className="text-gray-700">{response.response}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : ticket.status === 'pending' ? (
                      <p className="text-sm text-gray-500 italic">في انتظار الرد...</p>
                    ) : null}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                <MessageSquare className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <p>لا توجد تذاكر دعم فني حالياً</p>
                <p className="text-sm">استخدم النموذج لإنشاء تذكرة جديدة</p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CustomerSupport;
