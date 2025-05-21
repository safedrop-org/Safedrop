import React, { useState } from "react";
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
import { useNavigate, Link } from "react-router-dom";
import {
  UserIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
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
  id_image: z.any().optional(),
  license_image: z.any().optional(),
});

type DriverFormValues = z.infer<typeof driverRegisterSchema>;

const DriverRegisterContent = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);
  const [waitTime, setWaitTime] = useState(0);

  // Timer for rate limiting
  React.useEffect(() => {
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

  const form = useForm({
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
      id_image: undefined,
      license_image: undefined,
    },
  });

  const handleRateLimitError = () => {
    setWaitTime(60);
    toast.error(
      "تم تجاوز الحد المسموح للتسجيل، يرجى الانتظار دقيقة واحدة قبل المحاولة مرة أخرى"
    );
  };

  // File upload function - only used if files are provided
  const storeFileUploads = async (files) => {
    if (!files.id_image && !files.license_image) return null;

    // We'll store file information in localStorage for later processing after email verification
    const fileInfo = {};

    if (files.id_image) {
      // Read file as data URL for temporary storage
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            fileInfo.id_image = {
              name: files.id_image.name,
              type: files.id_image.type,
              size: files.id_image.size,
              dataUrl: e.target.result,
            };
          }

          if (files.license_image) {
            const licenseReader = new FileReader();
            licenseReader.onload = (licenseEvent) => {
              if (licenseEvent.target && licenseEvent.target.result) {
                fileInfo.license_image = {
                  name: files.license_image.name,
                  type: files.license_image.type,
                  size: files.license_image.size,
                  dataUrl: licenseEvent.target.result,
                };
              }
              resolve(fileInfo);
            };
            licenseReader.readAsDataURL(files.license_image);
          } else {
            resolve(fileInfo);
          }
        };
        reader.readAsDataURL(files.id_image);
      });
    } else if (files.license_image) {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            fileInfo.license_image = {
              name: files.license_image.name,
              type: files.license_image.type,
              size: files.license_image.size,
              dataUrl: e.target.result,
            };
          }
          resolve(fileInfo);
        };
        reader.readAsDataURL(files.license_image);
      });
    }

    return null;
  };

  const onSubmit = async (data) => {
    if (waitTime > 0) {
      toast.error(`يرجى الانتظار ${waitTime} ثانية قبل المحاولة مرة أخرى`);
      return;
    }

    setIsLoading(true);
    setRegistrationError(null);

    try {
      // Handle file uploads if any
      let fileInfo = null;
      if (data.id_image || data.license_image) {
        setUploadingFiles(true);
        try {
          fileInfo = await storeFileUploads({
            id_image: data.id_image,
            license_image: data.license_image,
          });
        } catch (uploadError) {
          console.error("Error preparing file uploads:", uploadError);
        } finally {
          setUploadingFiles(false);
        }
      }

      // Step 1: Create auth user (similar to CustomerRegister)
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
            .includes("email rate limit exceeded") ||
          signUpError.code === "over_email_send_rate_limit"
        ) {
          handleRateLimitError();
        } else if (signUpError.message.includes("already registered")) {
          throw new Error(
            "البريد الإلكتروني مسجل بالفعل، يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول"
          );
        } else {
          throw signUpError;
        }
      }

      if (!authData.user) {
        throw new Error("فشل إنشاء حساب المستخدم");
      }

      // Store driver details in cookies for later use in AuthCallback
      const pendingDriverDetails = {
        id: authData.user.id,
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
      Cookies.set("pendingUserDetails", JSON.stringify(pendingDriverDetails), {
        expires: 1 / 24, // 1 hour
        secure: true,
        sameSite: "strict",
      });

      // If we have file info, store it in local storage
      if (fileInfo) {
        localStorage.setItem(
          `driverFiles_${authData.user.id}`,
          JSON.stringify(fileInfo)
        );
      }

      setRegistrationComplete(true);
    } catch (error) {
      const errorMsg = error.message || t("registrationError");
      setRegistrationError(errorMsg);
      toast.error(t("registrationError"), { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-safedrop-primary">
            تم إنشاء حسابك بنجاح!
          </h2>
          <p className="mt-2 text-gray-600">
            لقد تم إرسال رسالة تأكيد إلى بريدك الإلكتروني. يرجى التحقق من بريدك
            الإلكتروني وتأكيد حسابك قبل تسجيل الدخول.
          </p>
          <div className="mt-6">
            <Button
              onClick={() =>
                navigate("/login", {
                  state: { email: form.getValues("email") },
                })
              }
              className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
            >
              الذهاب إلى صفحة تسجيل الدخول
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8">
        <div className="text-center">
          <img
            alt="SafeDrop Logo"
            className="mx-auto h-20 w-auto mb-4"
            src="/lovable-uploads/264169e0-0b4b-414f-b808-612506987f4a.png"
          />
          <h2 className="text-3xl font-bold text-safedrop-primary">
            {t("driverRegister") || "تسجيل سائق"}
          </h2>
        </div>

        {waitTime > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-md p-4 mb-4 text-center">
            <h3 className="text-amber-800 font-medium">
              {language === "ar"
                ? "يرجى الانتظار قبل المحاولة مرة أخرى"
                : "Please wait before trying again"}
            </h3>
            <p className="text-amber-700 mt-1">
              {language === "ar"
                ? `الوقت المتبقي: ${waitTime} ثانية`
                : `Time remaining: ${waitTime} seconds`}
            </p>
            <p className="text-amber-600 text-sm mt-1">
              {language === "ar"
                ? "تم تجاوز الحد المسموح لمحاولات التسجيل. يرجى الانتظار قليلاً."
                : "Registration attempt limit exceeded. Please wait a moment."}
            </p>
          </div>
        )}

        {registrationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="flex gap-2 items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{registrationError}</p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                المعلومات الشخصية
              </h3>

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{t("firstName") || "الاسم الأول"}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder={
                              language === "ar" ? "الاسم الأول" : "First Name"
                            }
                            className="pl-10"
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
                      <FormLabel>{t("lastName") || "اسم العائلة"}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder={
                              language === "ar" ? "اسم العائلة" : "Last Name"
                            }
                            className="pl-10"
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
                    <FormLabel>{t("birthDate") || "تاريخ الميلاد"}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          type="date"
                          placeholder={
                            language === "ar" ? "تاريخ الميلاد" : "Birth Date"
                          }
                          className="pl-10"
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
                    <FormLabel>{t("email") || "البريد الإلكتروني"}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          type="email"
                          placeholder={
                            language === "ar" ? "البريد الإلكتروني" : "Email"
                          }
                          className="pl-10"
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
                    <FormLabel>{t("phone") || "رقم الهاتف"}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          type="tel"
                          placeholder={
                            language === "ar" ? "رقم الهاتف" : "Phone Number"
                          }
                          className="pl-10"
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
                    <FormLabel>{t("password") || "كلمة المرور"}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          type="password"
                          placeholder={
                            language === "ar" ? "••••••••" : "••••••••"
                          }
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Driver Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                معلومات السائق
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nationalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("nationalId") || "رقم الهوية الوطنية"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            language === "ar"
                              ? "رقم الهوية الوطنية"
                              : "National ID"
                          }
                          {...field}
                        />
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
                      <FormLabel>
                        {t("licenseNumber") || "رقم رخصة القيادة"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            language === "ar"
                              ? "رقم رخصة القيادة"
                              : "License Number"
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                معلومات المركبة
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleInfo.make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("vehicleMake") || "نوع السيارة"}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            language === "ar" ? "نوع السيارة" : "Vehicle Make"
                          }
                          {...field}
                        />
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
                      <FormLabel>
                        {t("vehicleModel") || "موديل السيارة"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            language === "ar"
                              ? "موديل السيارة"
                              : "Vehicle Model"
                          }
                          {...field}
                        />
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
                      <FormLabel>{t("vehicleYear") || "سنة الصنع"}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={
                            language === "ar" ? "سنة الصنع" : "Vehicle Year"
                          }
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
                      <FormLabel>{t("plateNumber") || "رقم اللوحة"}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            language === "ar" ? "رقم اللوحة" : "Plate Number"
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Document Uploads - Optional in this approach */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                المستندات المطلوبة
              </h3>
              <p className="text-sm text-gray-600">
                {language === "ar"
                  ? "يرجى رفع صور واضحة للمستندات المطلوبة (بحد أقصى 5 ميجابايت لكل ملف)"
                  : "Please upload clear images of required documents (max 5MB per file)"}
              </p>

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="id_image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        {t("nationalIdCard") || "صورة الهوية الوطنية"}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Validate file size (max 5MB)
                                if (file.size > 5 * 1024 * 1024) {
                                  toast.error(
                                    "حجم الملف كبير جداً، الحد الأقصى 5 ميجابايت"
                                  );
                                  return;
                                }
                                field.onChange(file);
                              }
                            }}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-safedrop-gold/10 file:text-safedrop-primary hover:file:bg-safedrop-gold/20"
                          />
                          {field.value && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>{field.value.name}</span>
                              <span className="text-gray-500">
                                ({(field.value.size / 1024 / 1024).toFixed(2)}{" "}
                                MB)
                              </span>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="license_image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {t("drivingLicense") || "صورة رخصة القيادة"}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Validate file size (max 5MB)
                                if (file.size > 5 * 1024 * 1024) {
                                  toast.error(
                                    "حجم الملف كبير جداً، الحد الأقصى 5 ميجابايت"
                                  );
                                  return;
                                }
                                field.onChange(file);
                              }
                            }}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-safedrop-gold/10 file:text-safedrop-primary hover:file:bg-safedrop-gold/20"
                          />
                          {field.value && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>{field.value.name}</span>
                              <span className="text-gray-500">
                                ({(field.value.size / 1024 / 1024).toFixed(2)}{" "}
                                MB)
                              </span>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90 disabled:opacity-50"
              disabled={isLoading || uploadingFiles || waitTime > 0}
            >
              {uploadingFiles
                ? language === "ar"
                  ? "جاري رفع المستندات..."
                  : "Uploading documents..."
                : isLoading
                ? t("registering") || "جاري التسجيل..."
                : t("register") || "تسجيل"}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-4">
          {t("alreadyHaveAccount") || "هل لديك حساب بالفعل؟"}{" "}
          <Link to="/login" className="text-safedrop-gold hover:underline">
            {t("login") || "تسجيل الدخول"}
          </Link>
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
