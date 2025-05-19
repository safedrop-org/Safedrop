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
import { LockIcon, ArrowLeftIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ResetPasswordContent = () => {
  const { t, language } = useLanguage();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const navigate = useNavigate();

  // Check if we have a recovery token in the URL
  useEffect(() => {
    const checkToken = async () => {
      try {
        // Try to get hash params first (standard format)
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        // Try to get query params as fallback
        const queryParams = new URLSearchParams(window.location.search);
        const queryToken = queryParams.get("token");

        if (accessToken && refreshToken) {
          // Set the session with the tokens
          try {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) throw error;
            setHasToken(true);
          } catch (err) {
            console.error("Error setting session:", err);
            setHasToken(false);
            toast.error(t("invalidResetLink"));
            setTimeout(() => {
              navigate("/forgot-password");
            }, 3000);
          }
        } else if (queryToken && type === "recovery") {
          // Try to verify the OTP token if it's in the query parameters
          try {
            const { error } = await supabase.auth.verifyOtp({
              token_hash: queryToken,
              type: "recovery",
            });

            if (error) throw error;
            setHasToken(true);
          } catch (err) {
            console.error("Error verifying OTP:", err);
            setHasToken(false);
            toast.error(t("invalidResetLink"));
            setTimeout(() => {
              navigate("/forgot-password");
            }, 3000);
          }
        } else {
          // Check if we already have a valid session that can update password
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError || !session) {
            setHasToken(false);
            toast.error(t("invalidResetLink"));
            setTimeout(() => {
              navigate("/forgot-password");
            }, 3000);
          } else {
            setHasToken(true);
          }
        }
      } catch (error) {
        console.error("Token verification error:", error);
        setHasToken(false);
        toast.error(t("invalidResetLink"));
        setTimeout(() => {
          navigate("/forgot-password");
        }, 3000);
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkToken();
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
      // Double-check session before updating password
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error(t("sessionExpired"));
        setIsLoading(false);
        setTimeout(() => {
          navigate("/forgot-password");
        }, 2000);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error("Password reset error:", error);
        toast.error(error.message || t("passwordUpdateError"));
      } else {
        setIsComplete(true);
        toast.success(t("passwordUpdatedSuccess"));

        // Sign out after password reset
        await supabase.auth.signOut();

        // Redirect after a few seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      console.error("Password reset exception:", error);
      toast.error(t("passwordUpdateError"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
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

            {!hasToken ? (
              <CardContent className="py-6 space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-red-600">{t("invalidResetLink")}</p>

                  <Button
                    className="mt-4 bg-safedrop-gold hover:bg-safedrop-gold/90"
                    onClick={() => navigate("/forgot-password")}
                  >
                    {t("goToForgotPassword")}
                  </Button>
                </div>
              </CardContent>
            ) : !isComplete ? (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-4">
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
            ) : (
              <CardContent className="py-6 space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-green-600">
                    {t("passwordUpdatedDescription")}
                  </p>
                  <p>{t("redirectingToLogin")}</p>

                  <Button
                    className="mt-4 bg-safedrop-gold hover:bg-safedrop-gold/90"
                    onClick={() => navigate("/login")}
                  >
                    {t("loginNow")}
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

const ResetPassword = () => {
  return (
    <LanguageProvider>
      <ResetPasswordContent />
    </LanguageProvider>
  );
};

export default ResetPassword;
