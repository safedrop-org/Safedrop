import { useState, useEffect } from "react";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LockIcon, ArrowLeftIcon, Loader2, ShieldIcon } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ResetPasswordContent = () => {
  const { t, language } = useLanguage();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Process the URL and handle the session at component mount
  useEffect(() => {
    const handleResetLink = async () => {
      try {
        // Get session to check if auto-login happened
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Now check for the presence of token-like parameters in URL
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const queryParams = new URLSearchParams(window.location.search);

        const hasAccessToken = hashParams.has("access_token");
        const hasToken = queryParams.has("token");
        const hasResetAction =
          hashParams.has("type") || queryParams.has("type");

        // If no evidence of a reset token in URL and no session, redirect
        if (!hasAccessToken && !hasToken && !session) {
          console.log("No reset token or session found");
          toast.error(t("invalidResetLink"));
          setTimeout(() => {
            navigate("/forgot-password");
          }, 2000);
          return;
        }

        // We're good to go - valid reset link detected
        console.log("Valid reset link detected");
      } catch (error) {
        console.error("Error processing reset link:", error);
        toast.error(t("errorProcessingResetLink"));
      } finally {
        setIsProcessing(false);
      }
    };

    handleResetLink();
  }, [navigate, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!password || !confirmPassword) {
      toast.error(t("pleaseEnterPassword"));
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("passwordsDoNotMatch"));
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error(t("passwordTooShort"));
      setIsLoading(false);
      return;
    }

    try {
      // Update the password - this uses the current session that was established
      // when the user clicked the reset link
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error("Password reset error:", error);
        toast.error(error.message || t("passwordUpdateError"));
        setIsLoading(false);
        return;
      }

      // Success! Now sign out for security
      setIsComplete(true);
      toast.success(t("passwordUpdatedSuccess"));

      try {
        // Sign out AFTER successful password change
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error("Error signing out:", signOutError);
        // Continue even if sign out fails
      }

      // Redirect after a few seconds
      setTimeout(() => {
        navigate("/login", {
          state: {
            message: t("passwordSuccessfullyReset"),
            type: "success",
          },
        });
      }, 3000);
    } catch (error) {
      console.error("Password reset exception:", error);
      toast.error(t("passwordUpdateError"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-16 bg-gray-50">
          <div className="max-w-md mx-auto px-4">
            <Card className="shadow-lg">
              <CardContent className="py-6 space-y-6">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 text-safedrop-primary animate-spin mx-auto" />
                  <p>{t("verifyingResetLink")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-16 bg-gray-50">
          <div className="max-w-md mx-auto px-4">
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-safedrop-primary">
                  {t("passwordUpdated")}
                </CardTitle>
                <CardDescription>{t("passwordUpdateSuccess")}</CardDescription>
              </CardHeader>
              <CardContent className="py-6 space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-green-600">
                    {t("passwordUpdatedDescription")}
                  </p>
                  <p>{t("redirectingToLogin")}</p>

                  <Button
                    className="mt-4 bg-safedrop-gold hover:bg-safedrop-gold/90"
                    onClick={() =>
                      navigate("/login", {
                        state: {
                          message: t("passwordSuccessfullyReset"),
                          type: "success",
                        },
                      })
                    }
                  >
                    {t("loginNow")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 bg-gray-50">
        <div className="max-w-md mx-auto px-4">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-safedrop-primary">
                {t("resetPasswordTitle")}
              </CardTitle>
              <CardDescription>{t("resetPasswordDescription")}</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-4">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-md mb-2">
                  <div className="flex gap-2 items-start">
                    <ShieldIcon className="h-5 w-5 text-blue-700 mt-0.5 shrink-0" />
                    <p className="text-blue-700 text-sm">
                      {t("resetPasswordSecurityNote") ||
                        "Enter your new password to complete the reset process. You will need to sign in with your new password after this step."}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t("newPassword")}</Label>
                  <div className="relative">
                    <LockIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 rtl:left-auto rtl:right-3" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-10 rtl:pl-4 rtl:pr-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {t("confirmPassword")}
                  </Label>
                  <div className="relative">
                    <LockIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 rtl:left-auto rtl:right-3" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="pl-10 rtl:pl-4 rtl:pr-10"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      {t("updating")}
                    </>
                  ) : (
                    t("updatePassword")
                  )}
                </Button>

                <Link
                  to="/login"
                  className="flex items-center justify-center text-safedrop-gold hover:underline"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t("backToLogin")}
                </Link>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ResetPassword = () => {
  return (
    <LanguageProvider>
      <ResetPasswordContent />
    </LanguageProvider>
  );
};

export default ResetPassword;
