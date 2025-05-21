// src/components/DriverRegister.tsx
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
import { useNavigate, Link } from "react-router-dom";
import {
  UserIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  Calendar,
  CheckCircle2,
  FileText,
  CreditCard,
} from "lucide-react";
import Cookies from "js-cookie";

const driverRegisterSchema = z.object({
  firstName: z.string().min(2, { message: "الاسم الأول مطلوب" }),
  lastName: z.string().min(2, { message: "اسم العائلة مطلوب" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  phone: z.string().min(10, { message: "رقم الهاتف غير صالح" }),
  password: z
    .string()
    .min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }),
  birthDate: z.date({
    required_error: "تاريخ الميلاد مطلوب",
    invalid_type_error: "تاريخ الميلاد غير صالح",
  }),
  nationalId: z.string().min(10, { message: "رقم الهوية مطلوب" }),
  licenseNumber: z.string().min(5, { message: "رقم الرخصة مطلوب" }),
  vehicleInfo: z.object({
    make: z.string().min(2, { message: "نوع السيارة مطلوب" }),
    model: z.string().min(2, { message: "موديل السيارة مطلوب" }),
    year: z.string().regex(/^\d{4}$/, { message: "السنة يجب أن تكون 4 أرقام" }),
    plateNumber: z.string().min(4, { message: "رقم اللوحة مطلوب" }),
  }),
  id_image: z
    .any()
    .refine((val) => val instanceof File || !val, {
      message: "صورة الهوية يجب أن تكون ملف صالح",
    })
    .optional(),
  license_image: z
    .any()
    .refine((val) => val instanceof File || !val, {
      message: "صورة الرخصة يجب أن تكون ملف صالح",
    })
    .optional(),
});

type DriverFormValues = z.infer<typeof driverRegisterSchema>;

const DriverRegisterContent = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [waitTime, setWaitTime] = useState(0);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Clear any leftover auth tokens/cookies on mount
  useEffect(() => {
    clearAuthData();
    if (waitTime > 0) {
      const timer = setTimeout(() => setWaitTime((w) => w - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [waitTime]);

  const clearAuthData = () => {
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    // Clear pending data
    Cookies.remove("pendingDriverDetails");
    // Clear Supabase tokens
    if (window.localStorage) {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("sb-"))
        .forEach((k) => localStorage.removeItem(k));
    }
  };

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverRegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      birthDate: null,
      nationalId: "",
      licenseNumber: "",
      vehicleInfo: { make: "", model: "", year: "", plateNumber: "" },
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

  const uploadFile = async (file: File, folder: string, userId: string) => {
    const ext = file.name.split(".").pop();
    const fileName = `${userId}_${folder}_${Date.now()}.${ext}`;
    const filePath = `${folder}/${fileName}`;
    // Upload to your Supabase bucket
    const { error: uploadError } = await supabase.storage
      .from("driver-documents")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage
      .from("driver-documents")
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const onSubmit = async (data: DriverFormValues) => {
    if (waitTime > 0) {
      toast.error(`يرجى الانتظار ${waitTime} ثانية قبل المحاولة مرة أخرى`);
      return;
    }

    setIsLoading(true);
    try {
      // 1) Sign up with Supabase Auth
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
              birth_date: new Date(data.birthDate).toISOString(),
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        }
      );
      if (signUpError) {
        if (
          signUpError.code === "over_email_send_rate_limit" ||
          signUpError.message.toLowerCase().includes("rate limit")
        ) {
          handleRateLimitError();
          return;
        }
        if (signUpError.message.includes("already registered")) {
          toast.error(
            "البريد الإلكتروني مسجل بالفعل، يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول"
          );
          return;
        }
        throw signUpError;
      }

      const userId = authData.user!.id;

      // 2) Upload documents
      let idImageUrl: string | null = null;
      let licenseImageUrl: string | null = null;
      if (data.id_image || data.license_image) {
        setUploadingFiles(true);
        toast.info("جاري رفع المستندات...");
        try {
          const uploads: Promise<string | null>[] = [];
          if (data.id_image)
            uploads.push(uploadFile(data.id_image, "id-cards", userId));
          if (data.license_image)
            uploads.push(uploadFile(data.license_image, "licenses", userId));
          const results = await Promise.all(uploads);
          [idImageUrl, licenseImageUrl] =
            results.length === 2 ? results : [results[0], results[1] || null];
        } catch (e) {
          console.warn("Upload warning:", e);
          toast.warning("تحذير: فشل رفع المستندات، سيتم المتابعة دون صور");
        } finally {
          setUploadingFiles(false);
        }
      }

      // 3) Store everything in a cookie (1h expiry)
      Cookies.set(
        "pendingDriverDetails",
        JSON.stringify({
          id: userId,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email,
          user_type: "driver",
          birth_date: new Date(data.birthDate).toISOString(),
          nationalId: data.nationalId,
          licenseNumber: data.licenseNumber,
          vehicleInfo: data.vehicleInfo,
          idImageUrl,
          licenseImageUrl,
        }),
        { expires: 1 / 24, secure: true, sameSite: "strict" }
      );

      setRegistrationComplete(true);
      toast.success(
        "تم إرسال رسالة تأكيد إلى بريدك الإلكتروني. يرجى التحقق منها."
      );
    } catch (e: any) {
      console.error("Registration error:", e);
      toast.error("حدث خطأ أثناء التسجيل: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-8">
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-safedrop-primary">
            {t("registrationSuccess") || "تم التسجيل بنجاح!"}
          </h2>
          <p className="mt-2 text-gray-600">
            {language === "ar"
              ? "لقد تم إرسال رسالة تأكيد إلى بريدك الإلكتروني."
              : "A confirmation email has been sent to your inbox."}
          </p>
          <div className="mt-6">
            <Button
              onClick={() => navigate("/login")}
              className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
            >
              {t("login") || "تسجيل الدخول"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8">
        <div className="text-center mb-6">
          <img
            alt="SafeDrop Logo"
            src="/lovable-uploads/264169e0-0b4b-414f-b808-612506987f4a.png"
            className="mx-auto h-20 w-auto mb-4"
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
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
                            placeholder={t("firstName") || "الاسم الأول"}
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
                            placeholder={t("lastName") || "اسم العائلة"}
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
                          placeholder={t("birthDate") || "تاريخ الميلاد"}
                          className="pl-10"
                          {...field}
                          value={
                            field.value
                              ? new Date(field.value)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) => {
                            const date = e.target.value
                              ? new Date(e.target.value)
                              : null;
                            field.onChange(date);
                          }}
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
                          placeholder={t("email") || "البريد الإلكتروني"}
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
                          placeholder={t("phone") || "رقم الهاتف"}
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
                          placeholder="••••••••"
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
              <h3 className="text-lg font-semibold border-b pb-2">
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
                          placeholder={t("nationalId") || "رقم الهوية الوطنية"}
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
                          placeholder={t("licenseNumber") || "رقم رخصة القيادة"}
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
              <h3 className="text-lg font-semibold border-b pb-2">
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
                          placeholder={t("vehicleMake") || "نوع السيارة"}
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
                          placeholder={t("vehicleModel") || "موديل السيارة"}
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
                          min="1990"
                          max={new Date().getFullYear() + 1}
                          placeholder={t("vehicleYear") || "سنة الصنع"}
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
                          placeholder={t("plateNumber") || "رقم اللوحة"}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Document Uploads */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
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
                              if (file && file.size <= 5 * 1024 * 1024) {
                                field.onChange(file);
                              } else {
                                toast.error(
                                  "حجم الملف كبير جداً، الحد الأقصى 5 ميجابايت"
                                );
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
                              if (file && file.size <= 5 * 1024 * 1024) {
                                field.onChange(file);
                              } else {
                                toast.error(
                                  "حجم الملف كبير جداً، الحد الأقصى 5 ميجابا이트"
                                );
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

        <p className="text-center mt-4">
          {t("alreadyHaveAccount") || "هل لديك حساب بالفعل؟"}{" "}
          <Link to="/login" className="text-safedrop-gold hover:underline">
            {t("login") || "تسجيل الدخول"}
          </Link>
        </p>
      </div>
    </div>
  );
};

const DriverRegister = () => (
  <LanguageProvider>
    <DriverRegisterContent />
  </LanguageProvider>
);

export default DriverRegister;
