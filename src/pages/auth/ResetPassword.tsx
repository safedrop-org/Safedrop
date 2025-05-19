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
  const [hasToken, setHasToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [recoveryToken, setRecoveryToken] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL but do NOT log in automatically
  useEffect(() => {
    const extractTokenWithoutLogin = async () => {
      try {
        // Force sign out first to prevent any automatic login
        await supabase.auth.signOut();

        // Extract token from URL (both formats)
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const queryParams = new URLSearchParams(window.location.search);

        // Look for token in different possible locations
        const accessToken = hashParams.get("access_token");
        const queryToken = queryParams.get("token");
        const typeParam = hashParams.get("type") || queryParams.get("type");

        console.log("Checking for reset token...");

        // Store the token for later use (we'll need it for the password reset)
        if (accessToken) {
          console.log("Found access token in hash");
          setRecoveryToken(accessToken);
          setHasToken(true);
        } else if (queryToken) {
          console.log("Found token in query params");
          setRecoveryToken(queryToken);
          setHasToken(true);
        } else {
          console.log("No token found in URL");
          setHasToken(false);
          toast.error(t("invalidResetLink"));
          setTimeout(() => {
            navigate("/forgot-password");
          }, 2000);
        }
      } catch (error) {
        console.error("Error extracting token:", error);
        setHasToken(false);
        toast.error(t("invalidResetLink"));
      } finally {
        setIsCheckingToken(false);
      }
    };

    extractTokenWithoutLogin();
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
      // Force sign out first to ensure we're in a clean state
      await supabase.auth.signOut();

      // Different approaches depending on the token format
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);
      const type = hashParams.get("type") || queryParams.get("type");

      let resetResult;

      // Using hash format access token and refresh token
      if (hashParams.get("access_token") && hashParams.get("refresh_token")) {
        // Temporary set session to perform the update
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        // Update the password
        resetResult = await supabase.auth.updateUser({ password });
      }
      // Using query parameter token (typically for OTP verification)
      else if (queryParams.get("token")) {
        const token = queryParams.get("token");

        // First verify the token
        await supabase.auth.verifyOtp({
          token_hash: token,
          type: "recovery",
        });

        // Then update the password
        resetResult = await supabase.auth.updateUser({ password });
      } else {
        throw new Error("No valid token found");
      }

      // Check for errors
      if (resetResult.error) {
        throw resetResult.error;
      }

      // Success! Now sign out again to be safe
      await supabase.auth.signOut();

      setIsComplete(true);
      toast.success(t("passwordUpdatedSuccess"));

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
      console.error("Password reset error:", error);
      toast.error(error.message || t("passwordUpdateError"));
      await supabase.auth.signOut(); // Sign out in case of error too
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
            ) : (
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
