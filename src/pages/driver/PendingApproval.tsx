
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle } from 'lucide-react';

const PendingApprovalContent = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 bg-white shadow-xl rounded-xl p-8 text-center">
        <div className="flex justify-center">
          <img 
            src="/lovable-uploads/921d22da-3d5c-4dd1-af5f-458968c49478.png" 
            alt="SafeDrop Logo" 
            className="h-20" 
          />
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6 text-right">
          <div className="flex items-start">
            <Clock className="h-6 w-6 text-yellow-500 ml-3" />
            <div>
              <p className="font-bold text-yellow-800">حسابك قيد المراجعة</p>
              <p className="text-yellow-700 mt-2">
                شكرًا لتسجيلك في منصة سيف دروب. يرجى العلم أن طلبك قيد المراجعة من قبل الإدارة.
                سيتم إشعارك عبر البريد الإلكتروني فور الانتهاء من مراجعة حسابك.
              </p>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mt-6">ماذا يحدث الآن؟</h2>
        
        <div className="space-y-4 mt-4">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-safedrop-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              1
            </div>
            <p className="mr-4 text-right">يقوم فريقنا بمراجعة المعلومات والوثائق التي قمت بتقديمها</p>
          </div>
          
          <div className="flex items-start">
            <div className="w-8 h-8 bg-safedrop-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              2
            </div>
            <p className="mr-4 text-right">قد يستغرق هذا ما بين 1-3 أيام عمل</p>
          </div>
          
          <div className="flex items-start">
            <div className="w-8 h-8 bg-safedrop-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              3
            </div>
            <p className="mr-4 text-right">سيتم إرسال إشعار إليك فور الموافقة على حسابك أو في حال احتجنا إلى معلومات إضافية</p>
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/')}
          >
            العودة للصفحة الرئيسية
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 text-safedrop-primary border-safedrop-primary hover:bg-safedrop-primary/10"
            onClick={() => window.location.reload()}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>تحديث الصفحة</span>
          </Button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>إذا كان لديك أي استفسار، يرجى التواصل مع <a href="mailto:support@safedrop.com" className="text-safedrop-gold hover:underline">فريق الدعم</a></p>
        </div>
      </div>
    </div>
  );
};

const PendingApproval = () => {
  return (
    <LanguageProvider>
      <PendingApprovalContent />
    </LanguageProvider>
  );
};

export default PendingApproval;
