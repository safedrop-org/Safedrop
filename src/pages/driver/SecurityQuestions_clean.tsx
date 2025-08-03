import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import SecurityQuestionField from '@/components/driver/common/SecurityQuestionField';
import EmailDisplayCard from '@/components/driver/common/EmailDisplayCard';
import DriverPageLayout from '@/components/driver/common/DriverPageLayout';

const SecurityQuestionsContent = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: profileData } = useProfile();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [questions, setQuestions] = useState({
    question1: '',
    answer1: '',
    question2: '',
    answer2: '',
    question3: '',
    answer3: ''
  });

  const [hasExistingQuestions, setHasExistingQuestions] = useState(false);
  const userEmail = profileData?.email || user?.email || '';

  // مصفوفة الحقول لتقليل التكرار
  const securityFields = [
    { 
      questionId: 'question1', 
      answerId: 'answer1', 
      questionValue: questions.question1, 
      answerValue: questions.answer1, 
      number: 1 
    },
    { 
      questionId: 'question2', 
      answerId: 'answer2', 
      questionValue: questions.question2, 
      answerValue: questions.answer2, 
      number: 2 
    },
    { 
      questionId: 'question3', 
      answerId: 'answer3', 
      questionValue: questions.question3, 
      answerValue: questions.answer3, 
      number: 3 
    }
  ];

  // دالة مساعدة للتحقق من صحة البيانات
  const validateQuestions = () => {
    return questions.question1 && questions.answer1 && 
           questions.question2 && questions.answer2 && 
           questions.question3 && questions.answer3;
  };

  // دالة مساعدة لإعداد البيانات للحفظ
  const prepareQuestionData = (email) => ({
    question_1: questions.question1,
    answer_1: questions.answer1,
    question_2: questions.question2,
    answer_2: questions.answer2,
    question_3: questions.question3,
    answer_3: questions.answer3,
    email: email,
    updated_at: new Date().toISOString()
  });

  // دالة مساعدة لتحديث البيانات من قاعدة البيانات
  const updateQuestionsFromData = (data) => {
    setQuestions({
      question1: data.question_1,
      answer1: data.answer_1,
      question2: data.question_2,
      answer2: data.answer_2,
      question3: data.question_3,
      answer3: data.answer_3
    });
    setHasExistingQuestions(true);
  };

  // دالة مساعدة لمعالجة العمليات مع قاعدة البيانات
  const performDatabaseOperation = async (operation, successMessage) => {
    const { error } = await operation();
    if (error) throw error;
    toast.success(t(successMessage));
  };

  // دالة مساعدة لمعالجة الأخطاء
  const handleError = (error, errorMessage, setLoadingState = null) => {
    console.error('Error:', error);
    toast.error(t(errorMessage));
    if (setLoadingState) setLoadingState(false);
  };

  useEffect(() => {
    const fetchSecurityQuestions = async () => {
      if (!isLoggedIn || !user) {
        navigate('/login');
        return;
      }

      try {
        // Check if the user already has security questions
        const { data, error } = await supabase
          .from('security_questions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          updateQuestionsFromData(data);
        }
      } catch (error) {
        console.error('Error fetching security questions:', error);
        toast.error(t('errorFetchingSecurityQuestions'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSecurityQuestions();
  }, [user, isLoggedIn, navigate, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuestions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // التحقق من صحة البيانات
    if (!validateQuestions()) {
      toast.error(t('allFieldsRequired'));
      setIsSaving(false);
      return;
    }

    try {
      const email = profileData?.email || user?.email;
      
      if (!email) {
        toast.error('Email address not found');
        setIsSaving(false);
        return;
      }

      const questionData = prepareQuestionData(email);

      if (hasExistingQuestions) {
        // تحديث الأسئلة الموجودة
        await performDatabaseOperation(
          () => supabase.from('security_questions').update(questionData).eq('user_id', user.id),
          'securityQuestionsUpdated'
        );
      } else {
        // إدراج أسئلة جديدة
        await performDatabaseOperation(
          () => supabase.from('security_questions').insert({ user_id: user.id, ...questionData }),
          'securityQuestionsCreated'
        );
        setHasExistingQuestions(true);
      }
    } catch (error) {
      handleError(error, 'errorSavingSecurityQuestions', setIsSaving);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DriverPageLayout title={t('securityQuestions')}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary"></div>
        </div>
      </DriverPageLayout>
    );
  }

  return (
    <DriverPageLayout title={t('securityQuestions')}>
      <EmailDisplayCard userEmail={userEmail} t={t} />
      
      <Card className="bg-white rounded-lg shadow-md max-w-2xl">
        <CardHeader>
          <CardTitle>{t('setupSecurityQuestions')}</CardTitle>
          <CardDescription>
            {t('securityQuestionsDescription')}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {securityFields.map((field) => (
              <SecurityQuestionField
                key={field.questionId}
                questionId={field.questionId}
                answerId={field.answerId}
                questionLabel={`${t('securityQuestion')} ${field.number}`}
                answerLabel={`${t('securityAnswer')} ${field.number}`}
                questionValue={field.questionValue}
                answerValue={field.answerValue}
                questionPlaceholder={t('securityQuestionPlaceholder')}
                answerPlaceholder={t('securityAnswerPlaceholder')}
                onChange={handleChange}
              />
            ))}
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="bg-safedrop-gold hover:bg-safedrop-gold/90"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('saving')}
                </>
              ) : hasExistingQuestions ? t('updateSecurityQuestions') : t('saveSecurityQuestions')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </DriverPageLayout>
  );
};

const SecurityQuestions = () => {
  return <SecurityQuestionsContent />;
};

export default SecurityQuestions;
