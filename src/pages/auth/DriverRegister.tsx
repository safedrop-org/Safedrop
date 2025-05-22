import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import Cookies from "js-cookie";

const driverRegisterSchema = z.object({
  firstName: z.string().min(2, {
    message: "الاسم الأول مطلوب",
  }),
  lastName: z.string().min(2, {
    message: "اسم العائلة مطلوب",
  }),
  email: z.string().email({
    message: "البريد الإلكتروني غير صالح",
  }),
  phone: z.string().min(10, {
    message: "رقم الهاتف غير صالح",
  }),
  password: z.string().min(8, {
    message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
  }),
  birthDate: z.string().min(1, {
    message: "تاريخ الميلاد مطلوب",
  }),
  nationalId: z.string().min(10, {
    message: "رقم الهوية مطلوب",
  }),
  licenseNumber: z.string().min(5, {
    message: "رقم الرخصة مطلوب",
  }),
  vehicleInfo: z.object({
    make: z.string().min(2, {
      message: "نوع السيارة مطلوب",
    }),
    model: z.string().min(2, {
      message: "موديل السيارة مطلوب",
    }),
    year: z.string().regex(/^\d{4}$/, {
      message: "السنة يجب أن تكون 4 أرقام",
    }),
    plateNumber: z.string().min(4, {
      message: "رقم اللوحة مطلوب",
    }),
  }),
  idImage: z.any().optional(),
  licenseImage: z.any().optional(),
});

type DriverFormValues = z.infer<typeof driverRegisterSchema>;

const DriverRegisterContent = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [waitTime, setWaitTime] = useState(0);
  const [idImagePreview, setIdImagePreview] = useState("");
  const [licenseImagePreview, setLicenseImagePreview] = useState("");
  const [idImageFile, setIdImageFile] = useState(null);
  const [licenseImageFile, setLicenseImageFile] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

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
    },
  });

  const handleRateLimitError = () => {
    setWaitTime(60);
    toast.error(t("registrationAttemptLimitExceeded"));
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
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

  // Store file data in localStorage for AuthCallback to process
  const storeFileData = (userId, idImage, licenseImage) => {
    const fileData = {};

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

  const onSubmit = async (data: DriverFormValues) => {
    if (waitTime > 0) {
      toast.error(`${t("pleaseWaitBeforeRetry")} ${waitTime} ${t("seconds")}`);
      return;
    }

    setIsLoading(true);
    setDebugInfo(null);

    try {
      // Step 1: Register the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
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
        }
      );

      if (signUpError) {
        if (
          signUpError.message.includes("rate limit") ||
          signUpError.message
            .toLowerCase()
            .includes("email rate limit exceeded")
        ) {
          handleRateLimitError();
        } else if (signUpError.message.includes("already registered")) {
          toast.error(t("invalidCredentials"));
        } else {
          toast.error(`${t("registrationError")}: ${signUpError.message}`);
        }
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error(t("registrationError"));
        setIsLoading(false);
        return;
      }

      // Step 2: Store files in localStorage for AuthCallback to process
      if (idImageFile || licenseImageFile) {
        storeFileData(authData.user.id, idImageFile, licenseImageFile);
      }

      // Step 3: Store user's pending details in a cookie for auth callback
      const pendingUserDetails = {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        email: data.email,
        user_type: "driver",
        birth_date: data.birthDate,
        national_id: data.nationalId,
        license_number: data.licenseNumber,
        vehicle_info: data.vehicleInfo,
      };

      // Store in cookie with 1 hour expiry
      Cookies.set("pendingUserDetails", JSON.stringify(pendingUserDetails), {
        expires: 1 / 24, // 1 hour
        secure: true,
        sameSite: "strict",
      });

      // Success - show confirmation screen
      setRegistrationComplete(true);
      toast.success(t("registrationSuccess"));
    } catch (error) {
      console.error("Unexpected error during registration:", error);
      toast.error(t("registrationError"));
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
      <div
        className={`min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${
          language === "ar" ? "rtl" : "ltr"
        }`}
      >
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <img
            src="/lovable-uploads/921d22da-3d5c-4dd1-af5f-458968c49478.png"
            alt="SafeDrop Logo"
            className="mx-auto h-20 w-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-safedrop-primary mt-6">
            {t("registrationSuccess")}
          </h2>
          <p className="mt-4 text-gray-600">{t("thankYouForRegistering")}</p>
          <p className="mt-4 text-gray-600">
            {language === "ar"
              ? "يرجى فتح البريد الإلكتروني والنقر على رابط التأكيد لإكمال عملية التسجيل."
              : "Please open the email and click on the confirmation link to complete the registration process."}
          </p>
          <div className="mt-8">
            <Button
              onClick={() => navigate("/login")}
              className="bg-safedrop-gold hover:bg-safedrop-gold/90"
            >
              {t("login")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${
        language === "ar" ? "rtl" : "ltr"
      }`}
    >
      <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8">
        <div className="text-center">
          <img
            alt="SafeDrop Logo"
            className="mx-auto h-20 w-auto mb-4"
            src="/lovable-uploads/264169e0-0b4b-414f-b808-612506987f4a.png"
          />
          <h2 className="text-3xl font-bold text-safedrop-primary">
            {t("driverRegister")}
          </h2>
        </div>

        {waitTime > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-md p-4 mb-4 text-center">
            <h3 className="text-amber-800 font-medium">
              {t("pleaseWaitBeforeRetry")}
            </h3>
            <p className="text-amber-700 mt-1">
              {t("timeRemaining")}: {waitTime} {t("seconds")}
            </p>
            <p className="text-amber-600 text-sm mt-1">
              {t("registrationAttemptLimitExceeded")}
            </p>
          </div>
        )}

        {debugInfo && (
          <div
            className={`bg-red-50 border border-red-200 rounded-md p-4 mb-4 text-xs ${
              language === "ar" ? "text-right" : "text-left"
            }`}
          >
            <h3 className="text-red-800 font-medium">
              Debug Info (Admin Only)
            </h3>
            <p className="text-red-700">Stage: {debugInfo.stage}</p>
            <p className="text-red-700">
              Error: {JSON.stringify(debugInfo.error)}
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
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t("firstName")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon
                          className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${
                            language === "ar" ? "right-3" : "left-3"
                          }`}
                        />
                        <Input
                          placeholder={t("firstName")}
                          className={language === "ar" ? "pr-10" : "pl-10"}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t("lastName")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon
                          className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${
                            language === "ar" ? "right-3" : "left-3"
                          }`}
                        />
                        <Input
                          placeholder={t("lastName")}
                          className={language === "ar" ? "pr-10" : "pl-10"}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("birthDate")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar
                        className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${
                          language === "ar" ? "right-3" : "left-3"
                        }`}
                      />
                      <Input
                        type="date"
                        placeholder={t("birthDate")}
                        className={language === "ar" ? "pr-10" : "pl-10"}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MailIcon
                        className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${
                          language === "ar" ? "right-3" : "left-3"
                        }`}
                      />
                      <Input
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        className={language === "ar" ? "pr-10" : "pl-10"}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("phone")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <PhoneIcon
                        className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${
                          language === "ar" ? "right-3" : "left-3"
                        }`}
                      />
                      <Input
                        type="tel"
                        placeholder={t("phonePlaceholder")}
                        className={language === "ar" ? "pr-10" : "pl-10"}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("password")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LockIcon
                        className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${
                          language === "ar" ? "right-3" : "left-3"
                        }`}
                      />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className={language === "ar" ? "pr-10" : "pl-10"}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nationalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("nationalId")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("nationalId")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("licenseNumber")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("licenseNumber")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicleInfo.make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("vehicleMake")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("vehicleMake")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicleInfo.model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("vehicleModel")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("vehicleModel")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
              <FormField
                control={form.control}
                name="vehicleInfo.plateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("plateNumber")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("plateNumber")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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

            <Button
              type="submit"
              className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
              disabled={isLoading || waitTime > 0}
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
      </div>
    </div>
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
