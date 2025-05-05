
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '@/components/ui/language-context';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const DriverSecurityQuestions = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingQuestions, setExistingQuestions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // تعريف مخطط التحقق
  const formSchema = z.object({
    question_1: z.string().min(3, { message: t('question1') + ' ' + t('required') }),
    answer_1: z.string().min(1, { message: t('answer1') + ' ' + t('required') }),
    question_2: z.string().min(3, { message: t('question2') + ' ' + t('required') }),
    answer_2: z.string().min(1, { message: t('answer2') + ' ' + t('required') }),
    question_3: z.string().min(3, { message: t('question3') + ' ' + t('required') }),
    answer_3: z.string().min(1, { message: t('answer3') + ' ' + t('required') }),
  });

  // تهيئة نموذج react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question_1: '',
      answer_1: '',
      question_2: '',
      answer_2: '',
      question_3: '',
      answer_3: '',
    },
  });

  // تحميل الأسئلة الموجودة عند تحميل الصفحة
  useEffect(() => {
    const loadExistingQuestions = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('security_questions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching security questions:', error);
          toast.error(error.message);
        } else if (data) {
          // إذا وجدت أسئلة موجودة، قم بتعبئة النموذج بها
          setExistingQuestions(data);
          form.reset({
            question_1: data.question_1,
            answer_1: data.answer_1,
            question_2: data.question_2,
            answer_2: data.answer_2,
            question_3: data.question_3,
            answer_3: data.answer_3,
          });
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingQuestions();
  }, [user, form]);

  // تقديم النموذج
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error(t('loginRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      // إذا كانت هناك أسئلة موجودة بالفعل، قم بتحديثها، وإلا قم بإنشاء جديدة
      if (existingQuestions) {
        const { error } = await supabase
          .from('security_questions')
          .update(values)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('security_questions')
          .insert({
            user_id: user.id,
            ...values
          });

        if (error) throw error;
      }

      toast.success(t('questionsUpdated'));
    } catch (error: any) {
      console.error('Error saving security questions:', error);
      toast.error(error.message || t('errorOccurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DriverSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-center h-full">
            <p>{t('loading')}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{t('securityQuestions')}</CardTitle>
            <CardDescription>{t('securityQuestionsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  {/* سؤال وإجابة 1 */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="question_1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('question1')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('question1')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="answer_1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('answer1')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('answer1')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* سؤال وإجابة 2 */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="question_2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('question2')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('question2')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="answer_2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('answer2')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('answer2')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* سؤال وإجابة 3 */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="question_3"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('question3')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('question3')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="answer_3"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('answer3')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('answer3')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('savingQuestions') : t('saveQuestions')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DriverSecurityQuestions;
