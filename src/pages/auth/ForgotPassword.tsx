
import { useState } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MailIcon, ArrowLeftIcon, Loader2, ShieldIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ForgotPasswordContent = () => {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState('email'); // email, questions, success
  const [securityQuestions, setSecurityQuestions] = useState(null);
  const [answers, setAnswers] = useState({
    answer1: '',
    answer2: '',
    answer3: ''
  });
  
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      toast.error(t('pleaseEnterEmail'));
      setIsLoading(false);
      return;
    }

    try {
      // First, check if the user exists in the database
      const { data: userExists, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      // If there's an error checking the user or the user doesn't exist
      if (checkError) {
        console.error('User check error:', checkError);
        toast.error(t('userNotFound'));
        setIsLoading(false);
        return;
      } 
      
      if (!userExists) {
        console.log('User not found with email:', email);
        toast.error(t('userNotFound'));
        setIsLoading(false);
        return;
      }

      // Fetch the user's security questions
      const { data: questions, error: questionsError } = await supabase
        .rpc('get_security_questions', { user_email: email });

      if (questionsError) {
        console.error('Error fetching security questions:', questionsError);
        toast.error(t('errorFetchingSecurityQuestions'));
        setIsLoading(false);
        return;
      }

      if (!questions || questions.length === 0) {
        // No security questions found, fall back to email method
        handleFallbackEmailReset();
        return;
      }

      // Set the security questions and move to the next step
      setSecurityQuestions(questions[0]);
      setCurrentStep('questions');
      setIsLoading(false);
    } catch (error) {
      console.error('Error in email verification step:', error);
      toast.error(t('errorProcessingRequest'));
      setIsLoading(false);
    }
  };

  const handleFallbackEmailReset = async () => {
    try {
      // Process the password reset request using email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Reset password error:', error);
        toast.error(error.message || t('passwordResetError'));
      } else {
        setIsSubmitted(true);
        setCurrentStep('success');
        toast.success(t('passwordResetEmailSent'));
      }
    } catch (error) {
      console.error('Reset password exception:', error);
      toast.error(t('passwordResetError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswersSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!answers.answer1 || !answers.answer2 || !answers.answer3) {
      toast.error(t('allAnswersRequired'));
      setIsLoading(false);
      return;
    }

    try {
      // Check if the answers are correct
      const { data: isCorrect, error } = await supabase
        .rpc('check_security_questions', { 
          user_email: email, 
          q1_answer: answers.answer1,
          q2_answer: answers.answer2,
          q3_answer: answers.answer3
        });

      if (error) {
        console.error('Error checking security questions:', error);
        toast.error(t('errorCheckingAnswers'));
        setIsLoading(false);
        return;
      }

      if (!isCorrect) {
        toast.error(t('incorrectAnswers'));
        setIsLoading(false);
        return;
      }

      // Answers are correct, proceed with password reset
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        console.error('Reset password error:', resetError);
        toast.error(resetError.message || t('passwordResetError'));
        setIsLoading(false);
        return;
      }

      // Success
      setCurrentStep('success');
      toast.success(t('passwordResetEmailSent'));
    } catch (error) {
      console.error('Error in answers verification step:', error);
      toast.error(t('errorProcessingRequest'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (e) => {
    const { name, value } = e.target;
    setAnswers(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 bg-gray-50">
        <div className="max-w-md mx-auto px-4">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-safedrop-primary">
                {t('forgotPasswordTitle')}
              </CardTitle>
              <CardDescription>{t('forgotPasswordDescription')}</CardDescription>
            </CardHeader>

            {currentStep === 'email' && (
              <form onSubmit={handleEmailSubmit}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <div className="relative">
                      <MailIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 rtl:left-auto rtl:right-3" />
                      <Input 
                        id="email" 
                        type="email" 
                        className="pl-10 rtl:pl-4 rtl:pr-10" 
                        placeholder="your@email.com" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('checking')}
                      </>
                    ) : (
                      t('continue')
                    )}
                  </Button>

                  <Link to="/login" className="flex items-center justify-center text-safedrop-gold hover:underline">
                    <ArrowLeftIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t('backToLogin')}
                  </Link>
                </CardFooter>
              </form>
            )}

            {currentStep === 'questions' && securityQuestions && (
              <form onSubmit={handleAnswersSubmit}>
                <CardContent className="space-y-4 pt-4">
                  <div className="mb-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                      <p className="text-sm text-yellow-800">
                        {t('securityQuestionsVerification')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="answer1">{securityQuestions.question_1}</Label>
                      <Input 
                        id="answer1" 
                        name="answer1" 
                        type="text" 
                        value={answers.answer1} 
                        onChange={handleAnswerChange} 
                        placeholder={t('securityAnswerPlaceholder')} 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="answer2">{securityQuestions.question_2}</Label>
                      <Input 
                        id="answer2" 
                        name="answer2" 
                        type="text" 
                        value={answers.answer2} 
                        onChange={handleAnswerChange} 
                        placeholder={t('securityAnswerPlaceholder')} 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="answer3">{securityQuestions.question_3}</Label>
                      <Input 
                        id="answer3" 
                        name="answer3" 
                        type="text" 
                        value={answers.answer3} 
                        onChange={handleAnswerChange} 
                        placeholder={t('securityAnswerPlaceholder')} 
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('verifying')}
                      </>
                    ) : (
                      t('verifyAnswers')
                    )}
                  </Button>

                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => setCurrentStep('email')}
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    {t('back')}
                  </Button>
                </CardFooter>
              </form>
            )}

            {currentStep === 'success' && (
              <CardContent className="py-6 space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-green-600">{t('passwordResetEmailSentDescription')}</p>
                  
                  <Button 
                    className="mt-4 bg-safedrop-gold hover:bg-safedrop-gold/90" 
                    onClick={() => navigate('/login')}
                  >
                    {t('backToLogin')}
                  </Button>
                </div>
              </CardContent>
            )}
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
