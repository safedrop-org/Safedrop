
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail } from 'lucide-react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

// الخطوات المختلفة في عملية إعادة تعيين كلمة المرور
enum ResetStep {
  EMAIL, // إدخال البريد الإلكتروني
  SECURITY_QUESTIONS, // الإجابة على الأسئلة الأمنية
  NEW_PASSWORD, // إدخال كلمة المرور الجديدة
}

const ForgotPasswordContent = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState<ResetStep>(ResetStep.EMAIL);
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState<{
    question_1: string;
    question_2: string;
    question_3: string;
  } | null>(null);

  // مخطط التحقق للبريد الإلكتروني
  const emailSchema = z.object({
    email: z.string().email(t('invalidEmail')),
  });

  // مخطط التحقق للأسئلة الأمنية
  const securityQuestionsSchema = z.object({
    answer_1: z.string().min(1, t('required')),
    answer_2: z.string().min(1, t('required')),
    answer_3: z.string().min(1, t('required')),
  });

  // مخطط التحقق لكلمة المرور الجديدة
  const newPasswordSchema = z.object({
    password: z.string().min(8, t('passwordTooShort')),
    confirmPassword: z.string().min(8, t('passwordTooShort')),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('passwordsDoNotMatch'),
    path: ['confirmPassword'],
  });

  // تهيئة نماذج react-hook-form
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const securityQuestionsForm = useForm<z.infer<typeof securityQuestionsSchema>>({
    resolver: zodResolver(securityQuestionsSchema),
    defaultValues: {
      answer_1: '',
      answer_2: '',
      answer_3: '',
    },
  });

  const newPasswordForm = useForm<z.infer<typeof newPasswordSchema>>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // تقديم نموذج البريد الإلكتروني
  const onSubmitEmail = async (values: z.infer<typeof emailSchema>) => {
    setIsLoading(true);
    try {
      // حفظ البريد الإلكتروني للخطوات اللاحقة
      setEmail(values.email);

      // استرجاع الأسئلة الأمنية باستخدام الدالة المخصصة
      const { data, error } = await supabase
        .rpc('get_security_questions', {
          user_email: values.email
        });

      if (error) {
        console.error('Error fetching security questions:', error);
        toast.error(t('errorOccurred'));
        return;
      }

      if (!data || data.length === 0) {
        toast.error(t('noSecurityQuestions'));
        return;
      }

      // حفظ الأسئلة الأمنية وتغيير الخطوة
      setSecurityQuestions(data[0]);
      setStep(ResetStep.SECURITY_QUESTIONS);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || t('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  // تقديم نموذج الأسئلة الأمنية
  const onSubmitSecurityQuestions = async (values: z.infer<typeof securityQuestionsSchema>) => {
    setIsLoading(true);
    try {
      // التحقق من إجابات الأسئلة الأمنية
      const { data, error } = await supabase
        .rpc('check_security_questions', {
          user_email: email,
          q1_answer: values.answer_1,
          q2_answer: values.answer_2,
          q3_answer: values.answer_3
        });

      if (error) {
        console.error('Error checking security questions:', error);
        toast.error(t('errorOccurred'));
        return;
      }

      if (!data) {
        toast.error(t('incorrectAnswers'));
        return;
      }

      // إذا كانت الإجابات صحيحة، انتقل إلى خطوة إعادة تعيين كلمة المرور
      setStep(ResetStep.NEW_PASSWORD);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || t('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  // تقديم نموذج كلمة المرور الجديدة
  const onSubmitNewPassword = async (values: z.infer<typeof newPasswordSchema>) => {
    setIsLoading(true);
    try {
      // الحصول على معرف المستخدم باستخدام البريد الإلكتروني
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', email)
        .maybeSingle();

      if (profileError || !profileData) {
        console.error('Error getting user profile:', profileError);
        toast.error(t('userNotFound'));
        return;
      }

      // تحديث كلمة المرور
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });

      if (error) {
        console.error('Error updating password:', error);
        toast.error(t('passwordResetError'));
        return;
      }

      toast.success(t('passwordUpdated'));
      
      // إعادة التوجيه إلى صفحة تسجيل الدخول
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || t('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  // عرض الخطوة المناسبة
  const renderStep = () => {
    switch (step) {
      case ResetStep.EMAIL:
        return (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 rtl:left-auto rtl:right-3" />
                        <Input 
                          placeholder="your@email.com" 
                          className="pl-10 rtl:pl-4 rtl:pr-10" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
                disabled={isLoading}
              >
                {isLoading ? t('loading') : t('continue')}
              </Button>
            </form>
          </Form>
        );

      case ResetStep.SECURITY_QUESTIONS:
        return (
          <Form {...securityQuestionsForm}>
            <form onSubmit={securityQuestionsForm.handleSubmit(onSubmitSecurityQuestions)} className="space-y-4">
              {securityQuestions && (
                <>
                  <FormField
                    control={securityQuestionsForm.control}
                    name="answer_1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{securityQuestions.question_1}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={securityQuestionsForm.control}
                    name="answer_2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{securityQuestions.question_2}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={securityQuestionsForm.control}
                    name="answer_3"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{securityQuestions.question_3}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <Button
                type="submit"
                className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
                disabled={isLoading}
              >
                {isLoading ? t('loading') : t('verifyAnswers')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep(ResetStep.EMAIL)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('back')}
              </Button>
            </form>
          </Form>
        );

      case ResetStep.NEW_PASSWORD:
        return (
          <Form {...newPasswordForm}>
            <form onSubmit={newPasswordForm.handleSubmit(onSubmitNewPassword)} className="space-y-4">
              <FormField
                control={newPasswordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('newPassword')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newPasswordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('confirmPassword')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
                disabled={isLoading}
              >
                {isLoading ? t('loading') : t('updatePassword')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep(ResetStep.SECURITY_QUESTIONS)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('back')}
              </Button>
            </form>
          </Form>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 bg-gray-50">
        <div className="max-w-md mx-auto px-4">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-safedrop-primary">
                {step === ResetStep.EMAIL && t('forgotPassword')}
                {step === ResetStep.SECURITY_QUESTIONS && t('answerSecurityQuestions')}
                {step === ResetStep.NEW_PASSWORD && t('resetPassword')}
              </CardTitle>
              <CardDescription>
                {step === ResetStep.EMAIL && t('enterEmail')}
                {step === ResetStep.SECURITY_QUESTIONS && t('enterAnswers')}
                {step === ResetStep.NEW_PASSWORD && t('passwordResetDescription')}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              {renderStep()}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              {step === ResetStep.EMAIL && (
                <div className="text-center text-sm">
                  <Link to="/login" className="text-safedrop-gold hover:underline font-semibold">
                    {t('backToLogin')}
                  </Link>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ForgotPassword = () => {
  return (
    <LanguageProvider>
      <ForgotPasswordContent />
    </LanguageProvider>
  );
};

export default ForgotPassword;
