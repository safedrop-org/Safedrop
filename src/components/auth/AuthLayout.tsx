import React from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AUTH_CONSTANTS } from "./authConstants";

// Layout Components
export const PageLayout: React.FC<{ 
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${className}`}>
    <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8">
      {children}
    </div>
  </div>
);

export const CenteredPageLayout: React.FC<{ 
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`min-h-screen flex flex-col justify-center items-center bg-gray-50 ${className}`}>
    <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
      {children}
    </div>
  </div>
);

export const LogoHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="text-center">
    <img
      alt="SafeDrop Logo"
      className="mx-auto h-20 w-auto mb-4"
      src={AUTH_CONSTANTS.LOGO_SRC}
    />
    <h2 className="text-3xl font-bold text-safedrop-primary">{title}</h2>
  </div>
);

export const ErrorAlert: React.FC<{ 
  message: string; 
  type?: "success" | "error" 
}> = ({ message, type = "error" }) => (
  <div className={`border rounded-lg p-4 text-center mx-6 my-2 ${
    type === "success" 
      ? "bg-green-50 border-green-200" 
      : "bg-red-50 border-red-200"
  }`}>
    <div className="flex gap-2 items-center justify-center">
      {type === "success" ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <AlertCircle className="h-5 w-5 text-red-500" />
      )}
      <p className={type === "success" ? "text-green-700" : "text-red-700"}>
        {message}
      </p>
    </div>
  </div>
);

export const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => (
  <CenteredPageLayout>
    <div className="mx-auto flex items-center justify-center">
      <Loader2 className="h-16 w-16 text-safedrop-primary animate-spin" />
    </div>
    <h2 className="text-2xl font-bold">{message}</h2>
    <p className="text-gray-600">يرجى الانتظار قليلاً.</p>
  </CenteredPageLayout>
);

export const SuccessPage: React.FC<{
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  additionalContent?: React.ReactNode;
}> = ({ title, description, buttonText, onButtonClick, additionalContent }) => (
  <CenteredPageLayout>
    <div className="mx-auto flex items-center justify-center">
      <CheckCircle2 className="h-16 w-16 text-green-500" />
    </div>
    <h2 className="text-2xl font-bold text-safedrop-primary">{title}</h2>
    <p className="mt-2 text-gray-600">{description}</p>
    {additionalContent}
    <div className="mt-6">
      <Button
        onClick={onButtonClick}
        className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
      >
        {buttonText}
      </Button>
    </div>
  </CenteredPageLayout>
);

export const VerificationSuccess: React.FC<{
  userType: string;
  onGoToLogin: () => void;
}> = ({ userType, onGoToLogin }) => {
  if (userType === "driver") {
    return (
      <SuccessPage
        title="تم تأكيد البريد الإلكتروني بنجاح!"
        description=""
        buttonText="الذهاب إلى صفحة تسجيل الدخول"
        onButtonClick={onGoToLogin}
        additionalContent={
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <h3 className="font-semibold text-yellow-800">طلبك قيد المراجعة</h3>
            <p className="text-yellow-700 mt-2">
              شكراً لتسجيلك كسائق في منصة سيف دروب. طلبك قيد المراجعة الآن من
              قبل فريق الإدارة. سنخبرك عبر البريد الإلكتروني بمجرد الموافقة على
              طلبك.
            </p>
          </div>
        }
      />
    );
  }

  return (
    <SuccessPage
      title="تم تأكيد البريد الإلكتروني بنجاح!"
      description="شكراً لاستخدامك منصة سيف دروب. يمكنك الآن تسجيل الدخول واستخدام خدماتنا."
      buttonText="الذهاب إلى صفحة تسجيل الدخول"
      onButtonClick={onGoToLogin}
    />
  );
};
