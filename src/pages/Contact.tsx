import { useState } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
const ContactContent = () => {
  const {
    t
  } = useLanguage();
  const {
    toast
  } = useToast();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "تم إرسال رسالتك بنجاح",
        description: "سنتواصل معك في أقرب وقت ممكن"
      });
      setFormState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1500);
  };
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-safedrop-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">اتصل بنا</h1>
            <p className="text-xl max-w-3xl mx-auto">
              نحن هنا للإجابة على أسئلتك ومساعدتك في كل ما تحتاجه
            </p>
          </div>
        </section>

        {/* Contact Info and Form */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold mb-6 text-safedrop-primary">معلومات التواصل</h2>
                
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="shrink-0 mr-4 rtl:ml-4 rtl:mr-0">
                          <div className="w-12 h-12 bg-safedrop-primary rounded-full flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-safedrop-gold" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">العنوان</h3>
                          <p className="text-gray-600">المملكة العربية السعودية، الرياض</p>
                          
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="shrink-0 mr-4 rtl:ml-4 rtl:mr-0">
                          <div className="w-12 h-12 bg-safedrop-primary rounded-full flex items-center justify-center">
                            <Mail className="h-6 w-6 text-safedrop-gold" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">البريد الإلكتروني</h3>
                          <p className="text-gray-600">info@safedropksa.com</p>
                          <p className="text-gray-600">support@safedropksa.com</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="shrink-0 mr-4 rtl:ml-4 rtl:mr-0">
                          <div className="w-12 h-12 bg-safedrop-primary rounded-full flex items-center justify-center">
                            <Clock className="h-6 w-6 text-safedrop-gold" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">ساعات العمل</h3>
                          <p className="text-gray-600">الأحد - السبت : 9:00 ص - 9:00 م</p>
                          
                          
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-6 text-safedrop-primary">أرسل لنا رسالة</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">الاسم الكامل</Label>
                          <Input id="name" name="name" placeholder="أدخل اسمك الكامل" value={formState.name} onChange={handleChange} required />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">البريد الإلكتروني</Label>
                          <Input id="email" name="email" type="email" placeholder="example@email.com" value={formState.email} onChange={handleChange} required />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="phone">رقم الهاتف</Label>
                          <Input id="phone" name="phone" placeholder="05XXXXXXXX" value={formState.phone} onChange={handleChange} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="subject">الموضوع</Label>
                          <Input id="subject" name="subject" placeholder="موضوع الرسالة" value={formState.subject} onChange={handleChange} required />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message">الرسالة</Label>
                        <Textarea id="message" name="message" placeholder="اكتب رسالتك هنا..." rows={6} value={formState.message} onChange={handleChange} required />
                      </div>
                      
                      <Button type="submit" className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90" disabled={isSubmitting}>
                        {isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Map */}
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-200 rounded-lg overflow-hidden h-96">
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <p className="text-gray-600 text-center">هنا يمكن إضافة خريطة تفاعلية</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
};
const Contact = () => {
  return <LanguageProvider>
      <ContactContent />
    </LanguageProvider>;
};
export default Contact;