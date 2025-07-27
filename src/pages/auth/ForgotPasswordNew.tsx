import { useState } from "react";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MailIcon, ArrowLeftIcon, ShieldIcon } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthInput, AuthCard, LoadingButton } from "@/components/auth/AuthInput";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const ForgotPasswordContent = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("email"); // email, questions, success
  const [securityQuestions, setSecurityQuestions] = useState(null);
  const [answers, setAnswers] = useState({
    answer1: "",
    answer2: "",
    answer3: "",
  });
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      toast.error(t("pleaseEnterEmail") || "Please enter your email");
      setIsLoading(false);
      return;
    }

    // Validate email format
    const normalizedEmail = email.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    if (!isValidEmail) {
      toast.error(t("invalidEmailFormat") || "Invalid email format");
      setIsLoading(false);
      return;
    }

    try {
      // Check for security questions first
      const { data: securityQuestionsData, error: securityQuestionsError } =
        await supabase
          .from("security_questions")
          .select("*")
          .ilike("email", normalizedEmail)
          .maybeSingle();

      if (
        securityQuestionsError &&
        securityQuestionsError.code !== "PGRST116"
      ) {
        console.error("Error checking security questions:", securityQuestionsError);
        toast.error(t("errorProcessingRequest") || "Error processing request");
        setIsLoading(false);
        return;
      }

      // If security questions exist, use them for verification
      if (securityQuestionsData) {
        // Get the specific questions for this user
        const { data: questions, error: questionsError } = await supabase.rpc(
          "get_security_questions",
          { user_email: normalizedEmail }
        );

        if (questionsError) {
          console.error("Error fetching security questions:", questionsError);
          // Fall back to email reset
          sendPasswordResetEmail(normalizedEmail);
          return;
        }

        if (questions && questions.length > 0) {
          // Show security questions form
          setSecurityQuestions(questions[0]);
          setCurrentStep("questions");
          setIsLoading(false);
          return;
        }
      }

      // No security questions, send email reset
      sendPasswordResetEmail(normalizedEmail);
    } catch (error) {
      console.error("Error in forgot password flow:", error);
      toast.error(t("errorProcessingRequest") || "Error processing request");
      setIsLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email) => {
    try {
      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Reset password error:", error);
        // For security, still show success even if user not found
        if (error.message.includes("User not found")) {
          setCurrentStep("success");
          toast.success(t("passwordResetEmailSent") || "Password reset email sent");
        } else {
          toast.error(error.message || t("passwordResetError") || "Error sending reset email");
        }
      } else {
        setCurrentStep("success");
        toast.success(t("passwordResetEmailSent") || "Password reset email sent");
      }
    } catch (error) {
      console.error("Exception sending reset email:", error);
      toast.error(t("passwordResetError") || "Error sending reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswersSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!answers.answer1 || !answers.answer2 || !answers.answer3) {
      toast.error(t("pleaseAnswerAllQuestions") || "Please answer all security questions");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc("verify_security_answers", {
        user_email: email.trim().toLowerCase(),
        answer_1: answers.answer1.trim().toLowerCase(),
        answer_2: answers.answer2.trim().toLowerCase(),
        answer_3: answers.answer3.trim().toLowerCase(),
      });

      if (error) {
        console.error("Security verification error:", error);
        toast.error(t("verificationError") || "Error verifying security answers");
        setIsLoading(false);
        return;
      }

      if (data) {
        // Security questions verified, send reset email
        sendPasswordResetEmail(email.trim().toLowerCase());
      } else {
        toast.error(t("incorrectAnswers") || "Security answers are incorrect");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Exception verifying answers:", error);
      toast.error(t("verificationError") || "Error verifying security answers");
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (name, value) => {
    setAnswers((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <AuthCard 
        title={t("forgotPasswordTitle") || "Forgot Password"}
        description={t("forgotPasswordDescription") || "Enter your email to reset your password"}
      >
        {currentStep === "email" && (
          <form onSubmit={handleEmailSubmit}>
            <div className="space-y-4 p-6">
              <AuthInput
                id="email"
                label={t("email") || "Email"}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={MailIcon}
              />
            </div>

            <div className="px-6 pb-6 space-y-4">
              <LoadingButton
                isLoading={isLoading}
                loadingText={t("checking") || "Checking..."}
                normalText={t("continue") || "Continue"}
              />

              <Link
                to="/login"
                className="flex items-center justify-center text-safedrop-gold hover:underline"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t("backToLogin") || "Back to Login"}
              </Link>
            </div>
          </form>
        )}

        {currentStep === "questions" && securityQuestions && (
          <form onSubmit={handleAnswersSubmit}>
            <div className="space-y-4 p-6">
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <ShieldIcon className="h-5 w-5 text-safedrop-gold mr-2" />
                  <span className="font-semibold text-safedrop-primary">
                    {t("securityQuestions") || "Security Questions"}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  {t("answerSecurityQuestions") ||
                    "Please answer these security questions to verify your identity"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer1">{securityQuestions.question_1}</Label>
                <Input
                  id="answer1"
                  placeholder={t("yourAnswer") || "Your answer"}
                  value={answers.answer1}
                  onChange={(e) => handleAnswerChange("answer1", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer2">{securityQuestions.question_2}</Label>
                <Input
                  id="answer2"
                  placeholder={t("yourAnswer") || "Your answer"}
                  value={answers.answer2}
                  onChange={(e) => handleAnswerChange("answer2", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer3">{securityQuestions.question_3}</Label>
                <Input
                  id="answer3"
                  placeholder={t("yourAnswer") || "Your answer"}
                  value={answers.answer3}
                  onChange={(e) => handleAnswerChange("answer3", e.target.value)}
                />
              </div>
            </div>

            <div className="px-6 pb-6 space-y-4">
              <LoadingButton
                isLoading={isLoading}
                loadingText={t("verifying") || "Verifying..."}
                normalText={t("verifyAndReset") || "Verify and Reset Password"}
              />

              <button
                type="button"
                onClick={() => setCurrentStep("email")}
                className="w-full text-safedrop-gold hover:underline flex items-center justify-center"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                {t("back") || "Back"}
              </button>
            </div>
          </form>
        )}

        {currentStep === "success" && (
          <div className="py-6 space-y-6 p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <ArrowLeftIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-600">
                {t("emailSent") || "Email Sent!"}
              </h3>
              <p className="text-gray-600">
                {t("passwordResetEmailSentDescription") ||
                  "A password reset link has been sent to your email address. Please check your inbox and follow the instructions to reset your password."}
              </p>

              <Button
                className="mt-4 bg-safedrop-gold hover:bg-safedrop-gold/90"
                onClick={() => navigate("/login")}
              >
                {t("backToLogin") || "Back to Login"}
              </Button>
            </div>
          </div>
        )}
      </AuthCard>
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
