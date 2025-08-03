
import { useState } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Mail, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/layout/SEO';

const ContactContent = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const contactSchemaData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "سيف دروب - SafeDrop KSA",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+966-11-123-4567",
          "contactType": "customer service",
          "availableLanguage": ["Arabic", "English"],
          "hoursAvailable": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            "opens": "08:00",
            "closes": "22:00"
          }
        }
      ],
      "email": "info@safedropksa.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "شارع الملك فهد",
        "addressLocality": "الرياض",
        "addressRegion": "منطقة الرياض",
        "postalCode": "11564",
        "addressCountry": "SA"
      }
    }
  };
  
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
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
        title: t('messageSuccess'),
        description: t('messageSuccessDescription')
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="تواصل معنا - سيف دروب | خدمة عملاء متميزة 24/7 في السعودية"
        description="تواصل مع فريق خدمة العملاء في سيف دروب. نحن هنا لمساعدتك في جميع استفساراتك حول خدمات التوصيل الآمن في المملكة العربية السعودية. اتصل بنا، راسلنا، أو زر مكاتبنا."
        keywords="تواصل معنا سيف دروب, خدمة عملاء SafeDrop, رقم هاتف سيف دروب, عنوان مكاتب سيف دروب, دعم فني SafeDrop KSA, استفسارات التوصيل"
        url="https://www.safedropksa.com/contact"
        canonical="https://www.safedropksa.com/contact"
        schemaData={contactSchemaData}
      />
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-safedrop-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('contact')}</h1>
          </div>
        </section>

        {/* Contact Info and Form */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold mb-6 text-safedrop-primary">{t('contact')}</h2>
                
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
                          <h3 className="font-semibold text-lg mb-1">{t('location')}</h3>
                          <p className="text-gray-600">{t('locationAddress')}</p>
                        </div>
                      </div>
                    </CardContent>
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
                          <h3 className="font-semibold text-lg mb-1">{t('email')}</h3>
                          <p className="text-gray-600">info@safedropksa.com</p>
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
                          <h3 className="font-semibold text-lg mb-1">{t('workingHours')}</h3>
                          <p className="text-gray-600">{t('workingDays')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const Contact = () => {
  return (
    <LanguageProvider>
      <ContactContent />
    </LanguageProvider>
  );
};

export default Contact;
