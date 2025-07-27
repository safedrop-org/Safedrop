import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  Calendar,
  Upload,
  ExternalLink,
} from "lucide-react";
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
  CustomFormField 
} from "@/components/auth/FormFields";

const DriverRegisterContent = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [waitTime, setWaitTime] = useState(0);
  const [idImagePreview, setIdImagePreview] = useState("");
  const [licenseImagePreview, setLicenseImagePreview] = useState("");
  const [idImageFile, setIdImageFile] = useState<File | null>(null);
  const [licenseImageFile, setLicenseImageFile] = useState<File | null>(null);
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const driverRegisterSchema = z.object({
    firstName: z.string().min(AUTH_CONSTANTS.VALIDATION_RULES.MIN_NAME_LENGTH, {
      message: t("requiredFirstName"),
    }),
    lastName: z.string().min(AUTH_CONSTANTS.VALIDATION_RULES.MIN_NAME_LENGTH, {
      message: t("requiredLastName"),
    }),
    email: z.string().email({
      message: t("invalidEmail"),
    }),
    phone: z.string().min(AUTH_CONSTANTS.VALIDATION_RULES.MIN_PHONE_LENGTH, {
      message: t("invalidPhoneNumber"),
    }),
    password: z.string().min(AUTH_CONSTANTS.VALIDATION_RULES.MIN_PASSWORD_LENGTH, {
      message: t("passwordMinLength"),
    }),
    birthDate: z.string().min(1, {
      message: t("requiredBirthDate"),
    }),
    nationalId: z.string().min(AUTH_CONSTANTS.VALIDATION_RULES.MIN_NATIONAL_ID_LENGTH, {
      message: t("requiredNationalId"),
    }),
    licenseNumber: z.string().min(AUTH_CONSTANTS.VALIDATION_RULES.MIN_LICENSE_LENGTH, {
      message: t("requiredLicenseNumber"),
    }),
    vehicleInfo: z.object({
      make: z.string().min(AUTH_CONSTANTS.VALIDATION_RULES.MIN_VEHICLE_INFO_LENGTH, {
        message: t("requiredVehicleMake"),
      }),
      model: z.string().min(AUTH_CONSTANTS.VALIDATION_RULES.MIN_VEHICLE_INFO_LENGTH, {
        message: t("requiredVehicleModel"),
      }),
      year: z.string().regex(AUTH_CONSTANTS.VALIDATION_RULES.YEAR_REGEX, {
        message: t("requiredVehicleYear"),
      }),
      plateNumber: z.string().min(AUTH_CONSTANTS.VALIDATION_RULES.MIN_PLATE_NUMBER_LENGTH, {
        message: t("requiredPlateNumber"),
      }),
    }),
    idImage: z.any().optional(),
    licenseImage: z.any().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message:
        language === "ar"
          ? AUTH_CONSTANTS.ERROR_MESSAGES.TERMS_REQUIRED.ar
          : AUTH_CONSTANTS.ERROR_MESSAGES.TERMS_REQUIRED.en,
    }),
  });

  type DriverFormValues = z.infer<typeof driverRegisterSchema>;

  useEffect(() => {
    let timer;
    if (waitTime > 0) {
      timer = setTimeout(() => {
        setWaitTime(waitTime - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [waitTime]);

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverRegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      birthDate: "",
      nationalId: "",
      licenseNumber: "",
      vehicleInfo: {
        make: "",
        model: "",
        year: "",
        plateNumber: "",
      },
      acceptTerms: false,
    },
  });

  // Fixed email checking function using the database function - removed duplicate, using shared utility
  const handleEmailDuplicateError = () => {
    setRegistrationError(AUTH_CONSTANTS.DUPLICATE_EMAIL_MESSAGE);
    toast.error(AUTH_CONSTANTS.DUPLICATE_EMAIL_TOAST);
    setIsLoading(false);
  };

  const handleRateLimitError = () => {
    setWaitTime(60);
    setRegistrationError(AUTH_CONSTANTS.ERROR_MESSAGES.RATE_LIMIT);
    toast.error(AUTH_CONSTANTS.ERROR_MESSAGES.RATE_LIMIT);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'license') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "id") {
        setIdImagePreview(reader.result as string);
        setIdImageFile(file);
      } else {
        setLicenseImagePreview(reader.result as string);
        setLicenseImageFile(file);
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload single file to Supabase Storage
  const uploadSingleFile = async (file: File, userId: string, type: 'id' | 'license') => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}_${type}_image_${Date.now()}.${fileExt}`;
    const folderPath = type === 'id' ? 'id-cards' : 'licenses';
    const filePath = `${folderPath}/${fileName}`;

    const { error } = await supabase.storage
      .from("driver-documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error(`Error uploading ${type} image:`, error);
      return null;
    }

    const { data } = supabase.storage
      .from("driver-documents")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Upload files directly to Supabase Storage
  const uploadFilesToSupabase = async (userId: string) => {
    const uploadResults: { id_image?: string; license_image?: string } = {};
    
    try {
      // Upload ID image if exists
      if (idImageFile) {
        const idImageUrl = await uploadSingleFile(idImageFile, userId, 'id');
        if (idImageUrl) {
          uploadResults.id_image = idImageUrl;
        }
      }

      // Upload license image if exists
      if (licenseImageFile) {
        const licenseImageUrl = await uploadSingleFile(licenseImageFile, userId, 'license');
        if (licenseImageUrl) {
          uploadResults.license_image = licenseImageUrl;
        }
      }

      return uploadResults;
    } catch (error) {
      console.error("Error uploading files:", error);
      return uploadResults;
    }
  };

  // Store file data in localStorage as backup
  const storeFileData = (userId: string, idImage: File | null, licenseImage: File | null) => {
    const fileData: Record<string, { name: string; dataUrl: string }> = {};

    if (idImage) {
      fileData["id_image"] = {
        name: idImage.name,
        dataUrl: idImagePreview,
      };
    }

    if (licenseImage) {
      fileData["license_image"] = {
        name: licenseImage.name,
        dataUrl: licenseImagePreview,
      };
    }

    if (Object.keys(fileData).length > 0) {
      const fileDataKey = `driverFiles_${userId}`;
      localStorage.setItem(fileDataKey, JSON.stringify(fileData));
    }
  };

  // Create driver record directly
  const createDriverRecord = async (userId: string, data: DriverFormValues, imageUrls: { id_image?: string; license_image?: string }) => {
    try {
      const driverData = {
        id: userId,
        national_id: data.nationalId,
        license_number: data.licenseNumber,
        vehicle_info: data.vehicleInfo,
        status: "pending",
        is_available: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(imageUrls.id_image && { id_image: imageUrls.id_image }),
        ...(imageUrls.license_image && {
          license_image: imageUrls.license_image,
        }),
      };

      const { error: driverError } = await supabase
        .from("drivers")
        .insert(driverData);

      if (driverError) {
        console.error("Error creating driver record:", driverError);
        setDebugInfo({
          stage: "driver_insertion",
          error: driverError,
          data: driverData,
        });
        return false;
      }

      // Add driver role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: "driver",
        created_at: new Date().toISOString(),
      });

      if (roleError) {
        console.error("Error adding driver role:", roleError);
      }

      return true;
    } catch (error) {
      console.error("Error in createDriverRecord:", error);
      setDebugInfo({
        stage: "driver_creation",
        error: error,
      });
      return false;
    }
  };

  const openDriverTerms = () => {
    window.open("/driver-terms", "_blank");
  };

  // Handle signup error logic
  const handleSignUpError = (signUpError: { message: string }) => {
    if (
      signUpError.message.includes("rate limit") ||
      signUpError.message.toLowerCase().includes("email rate limit exceeded")
    ) {
      handleRateLimitError();
    } else if (
      signUpError.message.includes("User already registered") ||
      signUpError.message.includes("already been registered") ||
      signUpError.message.includes("duplicate") ||
      signUpError.message.includes("already exists") ||
      signUpError.message.includes("already taken")
    ) {
      handleEmailDuplicateError();
    } else {
      const errorMessage = AUTH_CONSTANTS.ERROR_MESSAGES.ACCOUNT_CREATION_ERROR(signUpError.message);
      setRegistrationError(errorMessage);
      toast.error(errorMessage);
    }
    setIsLoading(false);
  };

  // Create user account with Supabase Auth
  const createUserAccount = async (data: DriverFormValues) => {
    return await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          user_type: "driver",
          birth_date: data.birthDate,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // Complete registration process
  const completeRegistration = async (authData: { user: { id: string } }, data: DriverFormValues) => {
    const imageUrls = await uploadFilesToSupabase(authData.user.id);
    
    const driverCreated = await createDriverRecord(
      authData.user.id,
      data,
      imageUrls
    );

    if (!driverCreated) {
      storeFileData(authData.user.id, idImageFile, licenseImageFile);
    }

    const notificationData: UserData = {
      id: authData.user.id,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      email: data.email,
      user_type: "driver",
    };

    setPendingUserCookie(notificationData);
    await sendAdminNotification(notificationData, "driver");
    
    setRegistrationComplete(true);
    toast.success(t("registrationSuccess"));
  };

  // Removed duplicate sendAdminNotification function - using shared utility

  const onSubmit = async (data: DriverFormValues) => {
    if (waitTime > 0) {
      toast.error(AUTH_CONSTANTS.ERROR_MESSAGES.WAIT_MESSAGE(waitTime));
      return;
    }

    if (!acceptedTerms) {
      const termsMessage = language === "ar" 
        ? AUTH_CONSTANTS.ERROR_MESSAGES.TERMS_REQUIRED.ar 
        : AUTH_CONSTANTS.ERROR_MESSAGES.TERMS_REQUIRED.en;
      toast.error(termsMessage);
      return;
    }

    setIsLoading(true);
    setRegistrationError(null);
    setDebugInfo(null);

    try {
      const emailExists = await checkEmailExists(data.email);
      if (emailExists) {
        handleEmailDuplicateError();
        return;
      }

      const { data: authData, error: signUpError } = await createUserAccount(data);

      if (signUpError) {
        handleSignUpError(signUpError);
        return;
      }

      if (!authData.user) {
        setRegistrationError(AUTH_CONSTANTS.ERROR_MESSAGES.ACCOUNT_CREATION_FAILED);
        toast.error(AUTH_CONSTANTS.ERROR_MESSAGES.ACCOUNT_CREATION_FAILED);
        setIsLoading(false);
        return;
      }

      await completeRegistration(authData, data);
    } catch (error) {
      console.error("Unexpected error during registration:", error);
      setRegistrationError(AUTH_CONSTANTS.ERROR_MESSAGES.UNEXPECTED_ERROR);
      toast.error(AUTH_CONSTANTS.ERROR_MESSAGES.UNEXPECTED_ERROR);
      setDebugInfo({
        stage: "unexpected_error",
        error: error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationComplete) {
    return (
      <SuccessPage
        title={t("registrationSuccess")}
        description={language === "ar"
          ? "شكراً لتسجيلك في سيف دروب. تم إرسال رسالة تأكيد إلى بريدك الإلكتروني. يرجى فتح البريد الإلكتروني والنقر على رابط التأكيد لإكمال عملية التسجيل."
          : "Thank you for registering with SafeDrop. A confirmation email has been sent to your email. Please open the email and click on the confirmation link to complete the registration process."}
        buttonText={t("login")}
        onButtonClick={() => navigate("/login")}
      />
    );
  }

  return (
    <PageLayout>
      <LogoHeader title={t("driverRegister")} />

        {waitTime > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-md p-4 mb-4 text-center">
            <h3 className="text-amber-800 font-medium">
              {t("pleaseWaitBeforeRetry")}
            </h3>
            <p className="text-amber-700 mt-1">
              {t("timeRemaining")}: {waitTime} {t("seconds")}
            </p>
          </div>
        )}

        {registrationError && <ErrorAlert message={registrationError} />}

        {debugInfo && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 text-xs">
            <h3 className="text-red-800 font-medium">
              Debug Info (Admin Only)
            </h3>
            <p className="text-red-700">Stage: {String(debugInfo.stage)}</p>
            <p className="text-red-700">
              Error: {String(debugInfo.error)}
            </p>
            {debugInfo.data && (
              <pre className="mt-2 overflow-auto max-h-32">
                {JSON.stringify(debugInfo.data, null, 2)}
              </pre>
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-4">
              <CustomFormField
                control={form.control}
                name="firstName"
                label={t("firstName")}
                placeholder={t("firstName")}
                icon={UserIcon}
                className="flex-1"
              />
              <CustomFormField
                control={form.control}
                name="lastName"
                label={t("lastName")}
                placeholder={t("lastName")}
                icon={UserIcon}
                className="flex-1"
              />
            </div>

            <CustomFormField
              control={form.control}
              name="birthDate"
              label={t("birthDate")}
              placeholder={t("birthDate")}
              type="date"
              icon={Calendar}
            />

            <CustomFormField
              control={form.control}
              name="email"
              label={t("email")}
              placeholder={t("emailPlaceholder")}
              type="email"
              icon={MailIcon}
            />

            <CustomFormField
              control={form.control}
              name="phone"
              label={t("phone")}
              placeholder={t("phonePlaceholder")}
              type="tel"
              icon={PhoneIcon}
            />

            <CustomFormField
              control={form.control}
              name="password"
              label={t("password")}
              placeholder="••••••••"
              type="password"
              icon={LockIcon}
            />

            {/* الحقول التي تحتاج FormField عادي لأنها لا تحتوي على أيقونات */}
            <div className="grid grid-cols-2 gap-4">
              <CustomFormField
                control={form.control}
                name="nationalId"
                label={t("nationalId")}
                placeholder={t("nationalId")}
              />
              <CustomFormField
                control={form.control}
                name="licenseNumber"
                label={t("licenseNumber")}
                placeholder={t("licenseNumber")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CustomFormField
                control={form.control}
                name="vehicleInfo.make"
                label={t("vehicleMake")}
                placeholder={t("vehicleMake")}
              />
              <CustomFormField
                control={form.control}
                name="vehicleInfo.model"
                label={t("vehicleModel")}
                placeholder={t("vehicleModel")}
              />
              <FormField
                control={form.control}
                name="vehicleInfo.year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("vehicleYear")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("vehicleYear")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <CustomFormField
                control={form.control}
                name="vehicleInfo.plateNumber"
                label={t("plateNumber")}
                placeholder={t("plateNumber")}
              />
            </div>

            {/* ID Image Upload */}
            <FormItem>
              <FormLabel>{t("idImage")}</FormLabel>
              <div className="border rounded-md p-4">
                <input
                  type="file"
                  id="idImage"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "id")}
                  className="hidden"
                />
                <label
                  htmlFor="idImage"
                  className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  {idImagePreview ? (
                    <div className="relative w-full">
                      <img
                        src={idImagePreview}
                        alt="ID Preview"
                        className="h-32 mx-auto object-cover rounded-md"
                      />
                      <p className="text-sm text-center text-gray-500 mt-2">
                        {t("clickToChangeImage")}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {t("uploadIdImage")}
                      </span>
                    </>
                  )}
                </label>
              </div>
            </FormItem>

            {/* License Image Upload */}
            <FormItem>
              <FormLabel>{t("licenseImage")}</FormLabel>
              <div className="border rounded-md p-4">
                <input
                  type="file"
                  id="licenseImage"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "license")}
                  className="hidden"
                />
                <label
                  htmlFor="licenseImage"
                  className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  {licenseImagePreview ? (
                    <div className="relative w-full">
                      <img
                        src={licenseImagePreview}
                        alt="License Preview"
                        className="h-32 mx-auto object-cover rounded-md"
                      />
                      <p className="text-sm text-center text-gray-500 mt-2">
                        {t("clickToChangeImage")}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {t("uploadLicenseImage")}
                      </span>
                    </>
                  )}
                </label>
              </div>
            </FormItem>

            {/* Terms and Conditions Checkbox */}
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-1 rtl:gap-3  space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => {
                        setAcceptedTerms(checked === true);
                        field.onChange(checked);
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      {language === "ar" ? (
                        <span className="text-sm">
                          أوافق على{" "}
                          <a href="/driver-terms" target="_blank">
                            <button
                              type="button"
                              onClick={openDriverTerms}
                              className="text-safedrop-gold hover:underline inline-flex items-center gap-1"
                            >
                              الشروط والأحكام
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          </a>
                        </span>
                      ) : (
                        <span className="text-sm">
                          I agree to the{" "}
                          <button
                            type="button"
                            onClick={openDriverTerms}
                            className="text-safedrop-gold hover:underline inline-flex items-center gap-1"
                          >
                            Terms & Conditions
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
              disabled={isLoading || waitTime > 0 || !acceptedTerms}
            >
              {isLoading ? t("registering") : t("register")}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-4">
          {t("alreadyHaveAccount")}{" "}
          <a href="/login" className="text-safedrop-gold hover:underline">
            {t("login")}
          </a>
        </div>
    </PageLayout>
  );
};

const DriverRegister = () => {
  return (
    <LanguageProvider>
      <DriverRegisterContent />
    </LanguageProvider>
  );
};

export default DriverRegister;
