import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import {
  LockIcon,
  MailIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Cookies from "js-cookie";
import { User } from "@supabase/supabase-js";
import { ErrorAlert } from "@/components/auth/AuthLayout";
import { AuthInput, AuthCard, LoadingButton } from "@/components/auth/AuthInput";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Label } from "@/components/ui/label";

interface UserMetadata {
  id?: string;
  user_type?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

interface AuthError {
  message: string;
}

const LoginContent = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error" | null;
  }>({ text: "", type: null });
  const navigate = useNavigate();
  const location = useLocation();

  // Check for redirect messages from URL parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const verified = queryParams.get("verified") === "true";

    if (verified) {
      setStatusMessage({
        text: t("emailVerified"),
        type: "success",
      });

      // Remove the parameter from URL
      if (window.history.replaceState) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }

    // Then check location state
    if (location.state?.message) {
      setStatusMessage({
        text: location.state.message,
        type: location.state.type || "success",
      });

      // Pre-fill email if provided from verification
      if (location.state.verifiedEmail) {
        setEmail(location.state.verifiedEmail);
      }

      // Clear the state message
      window.history.replaceState(
        {
          ...window.history.state,
          message: undefined,
          type: undefined,
          verifiedEmail: undefined,
        },
        document.title
      );
    }
  }, [location, t]);

  // Set auth cookies
  const setAuthCookie = useCallback(
    (type: string, value: string = "true", email: string | null = null) => {
      Cookies.set(`${type}Auth`, value, {
        expires: rememberMe ? 7 : 1,
        secure: true,
        sameSite: "strict",
      });
      if (email && type === "admin") {
        Cookies.set("adminEmail", email, {
          expires: rememberMe ? 7 : 1,
          secure: true,
          sameSite: "strict",
        });
      }
    },
    [rememberMe]
  );

  // Clear auth cookies
  const clearAuthCookies = () => {
    Cookies.remove("adminAuth");
    Cookies.remove("adminEmail");
    Cookies.remove("customerAuth");
    Cookies.remove("driverAuth");
  };

  // Check if user has admin role from user_roles table
  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .single();

      return !error && data?.role === "admin";
    } catch (error) {
      console.error("Error checking admin role for user:", userId, error);
      return false;
    }
  };

  // Check login status - FIXED: Only run on login page, not when already logged in
  const checkLoginStatus = useCallback(async () => {
    try {
      // Check for logout param
      const queryParams = new URLSearchParams(window.location.search);
      const forceLogout = queryParams.get("logout") === "true";

      if (forceLogout) {
        await supabase.auth.signOut();
        clearAuthCookies();
        navigate("/login", { replace: true });
        setIsCheckingSession(false);
        return;
      }

      // CRITICAL FIX: Don't redirect if user is already authenticated and on protected routes
      // Only check and redirect when user is actually on the login page
      const currentPath = window.location.pathname;
      const isOnLoginPage =
        currentPath === "/login" || currentPath === "/admin";

      if (!isOnLoginPage) {
        setIsCheckingSession(false);
        return;
      }

      // Check for active session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        clearAuthCookies();
        setIsCheckingSession(false);
        return;
      }

      // Check email verification
      if (!session.user.email_confirmed_at) {
        navigate("/login", {
          replace: true,
          state: { email: session.user.email },
        });
        return;
      }

      // Check if user has admin role first
      const isAdmin = await checkAdminRole(session.user.id);

      if (isAdmin) {
        setAuthCookie("admin", "true", session.user.email);
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      // Get user type from metadata or profile for non-admin users
      const userTypeValue = await getUserType(session.user);

      if (!userTypeValue) {
        await supabase.auth.signOut();
        clearAuthCookies();
        setStatusMessage({
          text: t("unknownUserType"),
          type: "error",
        });
        setIsCheckingSession(false);
        return;
      }

      // Route based on user type using navigate
      if (userTypeValue === "customer") {
        setAuthCookie("customer");
        navigate("/customer/dashboard", { replace: true });
      } else if (userTypeValue === "driver") {
        setAuthCookie("driver");
        const { data } = await supabase
          .from("drivers")
          .select("status")
          .eq("id", session.user.id)
          .maybeSingle();

        navigate(
          data?.status === "approved"
            ? "/driver/dashboard"
            : "/driver/pending-approval",
          { replace: true }
        );
      } else {
        // If not admin and no valid user type, sign out
        await supabase.auth.signOut();
        clearAuthCookies();
        setStatusMessage({
          text: t("unknownUserType"),
          type: "error",
        });
        setIsCheckingSession(false);
      }
    } catch (error) {
      console.error("Error in checkLoginStatus:", error);
      clearAuthCookies();
      setIsCheckingSession(false);
    }
  }, [navigate, setAuthCookie, t]);

  // Get user type from metadata or profile
  const getUserType = async (user: User) => {
    // First try metadata
    const metadataType = (user.user_metadata as UserMetadata)?.user_type;
    if (metadataType) return metadataType;

    // Then try profile
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();

      if (profileData) return profileData.user_type;

      // Profile doesn't exist, create it
      if (
        profileError &&
        (profileError.code === "PGRST116" ||
          profileError.message.includes("JSON object requested"))
      ) {
        const userMetadata: UserMetadata = {
          id: user.id,
          first_name: (user.user_metadata as UserMetadata)?.first_name || "",
          last_name: (user.user_metadata as UserMetadata)?.last_name || "",
          phone: (user.user_metadata as UserMetadata)?.phone || "",
          user_type:
            (user.user_metadata as UserMetadata)?.user_type || "customer",
        };

        const { error: createError } = await supabase
          .from("profiles")
          .insert(userMetadata);

        if (createError)
          return (user.user_metadata as UserMetadata)?.user_type || null;
        return userMetadata.user_type;
      }
    } catch (err) {
      console.error("Error in getUserType:", err);
    }

    return null;
  };

  // Check login status on mount - FIXED: Only when on login page
  useEffect(() => {
    const currentPath = window.location.pathname;
    const shouldCheckStatus =
      currentPath === "/login" || currentPath === "/admin";

    if (shouldCheckStatus) {
      checkLoginStatus();
    } else {
      setIsCheckingSession(false);
    }
  }, [checkLoginStatus]);

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;
    setIsLoading(true);
    setStatusMessage({ text: "", type: null });

    if (!email || !password) {
      setStatusMessage({
        text: t("pleaseEnterEmailPassword"),
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Regular authentication for all users (including admin)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setStatusMessage({
            text: t("emailNotConfirmed"),
            type: "error",
          });

          setTimeout(() => {
            navigate("/login", { state: { email } });
          }, 1000);
        } else if (error.message.includes("Invalid login")) {
          setStatusMessage({
            text: t("invalidCredentials"),
            type: "error",
          });
        } else {
          setStatusMessage({
            text: error.message || t("loginError"),
            type: "error",
          });
        }

        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setStatusMessage({
          text: t("failedToGetUserInfo"),
          type: "error",
        });
        setIsLoading(false);
        return;
      }

      // Check email verification
      if (!data.user.email_confirmed_at) {
        navigate("/login", {
          state: { email: data.user.email },
        });
        return;
      }

      // First check if user has admin role
      const isAdmin = await checkAdminRole(data.user.id);

      if (isAdmin) {
        setAuthCookie("admin", "true", email);
        toast.success(t("loginAsAdmin"));
        setTimeout(() => {
          navigate("/admin/dashboard", { replace: true });
        }, 100);
        return;
      }

      // If not admin, get user type for regular users
      const userTypeValue = await getUserType(data.user);

      if (!userTypeValue) {
        setStatusMessage({
          text: t("unknownUserType"),
          type: "error",
        });
        setIsLoading(false);
        return;
      }

      toast.success(t("loginSuccess"));

      // Set cookies before redirection for non-admin users
      if (userTypeValue === "customer") {
        setAuthCookie("customer");
        setTimeout(() => {
          navigate("/customer/dashboard", { replace: true });
        }, 100);
      } else if (userTypeValue === "driver") {
        setAuthCookie("driver");

        // Check driver status
        const { data: driverData } = await supabase
          .from("drivers")
          .select("status")
          .eq("id", data.user.id)
          .maybeSingle();

        // Use navigate for reliable redirect
        setTimeout(() => {
          navigate(
            driverData?.status === "approved"
              ? "/driver/dashboard"
              : "/driver/pending-approval",
            { replace: true }
          );
        }, 100);
      } else {
        setStatusMessage({
          text: t("unknownUserType"),
          type: "error",
        });
        setIsLoading(false);
      }
    } catch (error: unknown) {
      setStatusMessage({
        text: t("loginError") + ": " + ((error as AuthError).message || ""),
        type: "error",
      });
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="w-16 h-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-safedrop-primary animate-spin" />
        </div>
        <p className="mt-4 text-gray-600">{t("checkingLoginStatus")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <AuthCard 
        title={t("login")} 
        description={t("loginDescription")}
      >
        {statusMessage.text && (
          <ErrorAlert 
            message={statusMessage.text}
            type={statusMessage.type || "error"}
          />
        )}

        <form onSubmit={handleLogin}>
          <div className="space-y-4 p-6">
            <AuthInput
              id="email"
              label={t("email")}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={MailIcon}
            />

            <AuthInput
              id="password"
              label={t("password")}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={LockIcon}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 text-safedrop-gold border-gray-300 rounded focus:ring-safedrop-gold"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <Label htmlFor="remember" className="text-sm">
                  {t("rememberMe")}
                </Label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-safedrop-gold hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            </div>
          </div>

          <div className="px-6 pb-6 space-y-4">
            <LoadingButton
              isLoading={isLoading}
              loadingText={t("loggingIn")}
              normalText={t("login")}
            />

            <div className="text-center text-sm">
              {t("noAccount")}{" "}
              <div className="flex justify-center gap-2 mt-2">
                <Link
                  to="/register/customer"
                  className="text-safedrop-gold hover:underline font-semibold"
                >
                  {t("registerAsCustomer")}
                </Link>
                <span className="text-gray-500">|</span>
                <Link
                  to="/register/driver"
                  className="text-safedrop-gold hover:underline font-semibold"
                >
                  {t("registerAsDriver")}
                </Link>
              </div>
            </div>
          </div>
        </form>
      </AuthCard>
      <Footer />
    </div>
  );
};

const Login = () => {
  return (
    <LanguageProvider>
      <LoginContent />
    </LanguageProvider>
  );
};

export default Login;
