import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { MessageSquare, Loader2, Send, Clock, CheckCircle, XCircle, Phone, Mail } from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';

const CustomerSupportContent = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        toast.error('Error loading support tickets');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user]);

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">Support & Help</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Call Us Card */}
          <Card className="flex flex-col items-center justify-center p-6">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <Phone className="text-green-600 w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Call Us</h2>
            <p className="text-sm mb-4">+966 55 616 0601</p>
            <Button variant="outline" onClick={() => window.open('tel:+966556160601')}>Call Us</Button>
          </Card>

          {/* Email Support Card */}
          <Card className="flex flex-col items-center justify-center p-6">
            <div className="bg-purple-100 p-3 rounded-full mb-4">
              <Mail className="text-purple-600 w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Email Support</h2>
            <p className="text-sm mb-4">support@safedropksa.com</p>
            <Button variant="outline" onClick={() => window.open('mailto:support@safedropksa.com')}>Email Support</Button>
          </Card>
        </div>

        {/* FAQs */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>كيف أتابع حالة طلبي؟</AccordionTrigger>
              <AccordionContent>
                يمكن للعميل متابعة حالة الطلب بناءً على تحديثات السائق لحالته أثناء الرحلة.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>ماذا أفعل إذا احتجت للمساعدة بخصوص طلبي؟</AccordionTrigger>
              <AccordionContent>
                يمكنك التواصل مع فريق الدعم عبر التطبيق أو البريد الإلكتروني في أي وقت.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>هل يمكنني التواصل مع السائق أثناء التوصيل؟</AccordionTrigger>
              <AccordionContent>
                نعم، يمكنك التواصل مع السائق عبر خاصية الرسائل أو الاتصال داخل التطبيق.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>كيف أطلب استرجاع مبلغ أو أرفع شكوى؟</AccordionTrigger>
              <AccordionContent>
                يمكنك فتح طلب عبر قسم الدعم، وسيتم التعامل معه حسب السياسة المعتمدة لدينا.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>هل يمكنني تعديل عنوان التوصيل بعد إرسال الطلب؟</AccordionTrigger>
              <AccordionContent>
                بعد قبول الطلب، قد تتوفر خيارات محددة للتعديل حسب حالة الطلب، يمكنك التواصل مع الدعم للمساعدة.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </main>
    </div>
  );
};

const CustomerSupport = () => {
  return (
    <LanguageProvider>
      <CustomerSupportContent />
    </LanguageProvider>
  );
};

export default CustomerSupport;
