import React, { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { useNavigate, Link } from "react-router-dom";
import {
  UserIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  PageLayout, 
  LogoHeader, 
  ErrorAlert, 
  SuccessPage 
} from "@/components/auth/AuthLayout";
import { 
  AUTH_CONSTANTS, 
  UserData 
} from "@/components/auth/authConstants";
import { 
  checkEmailExists, 
  isEmailDuplicateError, 
  sendAdminNotification, 
  setPendingUserCookie 
} from "@/components/auth/authUtils";
import { 
  CustomFormField, 
  FormFieldConfig 
} from "@/components/auth/FormFields";

// Schema definition (moved outside component to avoid recreating)
const createCustomerRegisterSchema = (t: (key: string) => string) => z.object({
  firstName: z.string().min(AUTH_CONSTANTS.MIN_NAME_LENGTH, { message: t("requiredFirstName") }),
  lastName: z.string().min(AUTH_CONSTANTS.MIN_NAME_LENGTH, { message: t("requiredLastName") }),
  email: z.string().email({ message: t("invalidEmail") }),
  phone: z.string().min(AUTH_CONSTANTS.MIN_PHONE_LENGTH, { message: t("invalidPhoneNumber") }),
  password: z.string().min(AUTH_CONSTANTS.MIN_PASSWORD_LENGTH, { message: t("passwordMinLength") }),
});

type CustomerFormValues = z.infer<ReturnType<typeof createCustomerRegisterSchema>>;

const CustomerRegisterContent = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  // Memoized schema to prevent recreation on every render
  const customerRegisterSchema = useMemo(() => createCustomerRegisterSchema(t), [t]);

  // Form configuration
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerRegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  // Utility functions
  const handleEmailDuplicateError = useCallback(() => {
    setRegistrationError(AUTH_CONSTANTS.DUPLICATE_EMAIL_MESSAGE);
    toast.error(AUTH_CONSTANTS.DUPLICATE_EMAIL_TOAST);
    setIsLoading(false);
  }, []);

  const onSubmit = async (data: CustomerFormValues) => {
    if (isLoading) return;

    setIsLoading(true);
    setRegistrationError(null);

    try {
      const emailExists = await checkEmailExists(data.email);

      if (emailExists) {
        handleEmailDuplicateError();
        return;
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            user_type: "customer",
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        if (isEmailDuplicateError(signUpError.message)) {
          handleEmailDuplicateError();
          return;
        }
        throw signUpError;
      }

      if (!authData.user) throw new Error(t("userCreationFailed"));

      const pendingUserDetails: UserData = {
        id: authData.user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        email: data.email,
        user_type: "customer",
      };

      setPendingUserCookie(pendingUserDetails);

      await sendAdminNotification(pendingUserDetails, "customer");

      setRegistrationComplete(true);
      toast.success(t("registrationSuccess"));
    } catch (error: unknown) {
      console.error("Registration error:", error);

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorMsg = isEmailDuplicateError(errorMessage)
        ? AUTH_CONSTANTS.DUPLICATE_EMAIL_TOAST
        : errorMessage || t("registrationError");

      setRegistrationError(errorMsg);
      toast.error(t("registrationError"), { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Form field configurations
  const formFields: FormFieldConfig[] = useMemo(() => [
    {
      name: "firstName",
      label: t("firstName"),
      placeholder: t("firstName"),
      icon: UserIcon,
    },
    {
      name: "lastName",
      label: t("lastName"),
      placeholder: t("lastName"),
      icon: UserIcon,
    },
    {
      name: "email",
      label: t("email"),
      placeholder: t("emailPlaceholder"),
      type: "email",
      icon: MailIcon,
    },
    {
      name: "phone",
      label: t("phone"),
      placeholder: t("phonePlaceholder"),
      type: "tel",
      icon: PhoneIcon,
    },
    {
      name: "password",
      label: t("password"),
      placeholder: "••••••••",
      type: "password",
      icon: LockIcon,
    },
  ], [t]);

  // Reusable components
  const SuccessPageComponent: React.FC = () => (
    <SuccessPage
      title={t("accountCreatedSuccessfully")}
      description={t("emailVerificationSuccess")}
      buttonText={t("goToLoginPage")}
      onButtonClick={() =>
        navigate("/login", {
          state: { email: form.getValues("email") },
        })
      }
    />
  );

  // Render
  if (registrationComplete) {
    return <SuccessPageComponent />;
  }

  return (
    <PageLayout>
      <LogoHeader title={t("customerRegister")} />
      
      {registrationError && <ErrorAlert message={registrationError} />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name fields */}
          <div className="flex gap-4">
            <CustomFormField
              control={form.control}
              name="firstName"
              label={formFields[0].label}
              placeholder={formFields[0].placeholder}
              icon={formFields[0].icon}
              className="flex-1"
            />
            <CustomFormField
              control={form.control}
              name="lastName"
              label={formFields[1].label}
              placeholder={formFields[1].placeholder}
              icon={formFields[1].icon}
              className="flex-1"
            />
          </div>

          {/* Other fields */}
          {formFields.slice(2).map((field) => (
            <CustomFormField
              key={field.name}
              control={form.control}
              name={field.name as keyof CustomerFormValues}
              label={field.label}
              placeholder={field.placeholder}
              type={field.type}
              icon={field.icon}
            />
          ))}

          <Button
            type="submit"
            className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
            disabled={isLoading}
          >
            {isLoading ? t("registering") : t("register")}
          </Button>
        </form>
      </Form>

      <div className="text-center mt-4">
        {t("alreadyHaveAccount")}{" "}
        <Link to="/login" className="text-safedrop-gold hover:underline">
          {t("login")}
        </Link>
      </div>
    </PageLayout>
  );
};

const CustomerRegister = () => (
  <LanguageProvider>
    <CustomerRegisterContent />
  </LanguageProvider>
);

export default CustomerRegister;
