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

// Enhanced schema with file uploads
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
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [waitTime, setWaitTime] = useState(0);

  // Clear any existing auth data on component mount
  useEffect(() => {
    clearAuthData();

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

  // Clear auth data helper function
  const clearAuthData = () => {
    // Clear all auth related cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Clear localStorage items
    localStorage.removeItem("pendingDriverRegistration");
    localStorage.removeItem("pendingDriverData");

    // Clear Supabase tokens from localStorage
    if (window.localStorage) {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("sb-"))
        .forEach((key) => localStorage.removeItem(key));
    }
  };

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

  // File upload function
  const uploadFile = async (file, folder, userId) => {
    if (!file) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}_${folder}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("driver-documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`فشل في رفع الملف: ${uploadError.message}`);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("driver-documents").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  };

  const onSubmit = async (data) => {
    if (waitTime > 0) {
      toast.error(`يرجى الانتظار ${waitTime} ثانية قبل المحاولة مرة أخرى`);
      return;
    }

    setIsLoading(true);
    setDebugInfo(null);

    try {
      // Step 1: Create auth user
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
              birth_date: new Date(data.birthDate),
            },
            emailRedirectTo: window.location.origin + "/auth/callback",
          },
        }
      );

      if (signUpError) {
        setDebugInfo({
          stage: "auth_signup",
          error: signUpError,
        });

        if (
          signUpError.message.includes("rate limit") ||
          signUpError.message
            .toLowerCase()
            .includes("email rate limit exceeded") ||
          signUpError.code === "over_email_send_rate_limit"
        ) {
          handleRateLimitError();
        } else if (signUpError.message.includes("already registered")) {
          toast.error(
            "البريد الإلكتروني مسجل بالفعل، يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول"
          );
        } else {
          toast.error("خطأ أثناء إنشاء الحساب: " + signUpError.message);
        }

        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setDebugInfo({
          stage: "auth_signup",
          error: "No user data returned",
          response: authData,
        });

        toast.error("فشل إنشاء الحساب، يرجى المحاولة مرة أخرى");
        setIsLoading(false);
        return;
      }

      const userId = authData.user.id;

      // Step 2: Upload document files if provided
      let idImageUrl = null;
      let licenseImageUrl = null;

      if (data.id_image || data.license_image) {
        setUploadingFiles(true);
        toast.info("جاري رفع المستندات...");

        try {
          // Perform uploads in parallel if both files exist
          const uploadPromises = [];

          if (data.id_image) {
            uploadPromises.push(uploadFile(data.id_image, "id-cards", userId));
          }

          if (data.license_image) {
            uploadPromises.push(
              uploadFile(data.license_image, "licenses", userId)
            );
          }

          const results = await Promise.all(uploadPromises);

          // Assign results based on which files were uploaded
          if (data.id_image && data.license_image) {
            [idImageUrl, licenseImageUrl] = results;
          } else if (data.id_image) {
            [idImageUrl] = results;
          } else if (data.license_image) {
            [licenseImageUrl] = results;
          }
        } catch (uploadError) {
          toast.warning(
            "تحذير: فشل في رفع المستندات، سيتم الاستمرار في التسجيل دون صور"
          );
          console.error("Upload error:", uploadError);
          // Continue with registration even if uploads fail
        } finally {
          setUploadingFiles(false);
        }
      }

      // Step 3: Try to use the server function
      try {
        const { data: funcResult, error: funcError } = await supabase.rpc(
          "register_driver",
          {
            user_id: userId,
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            email: data.email,
            birth_date: new Date(data.birthDate),
            national_id: data.nationalId,
            license_number: data.licenseNumber,
            vehicle_info: data.vehicleInfo,
            status: "pending",
            is_available: false,
          }
        );

        if (funcError) {
          console.error("Server function error:", funcError);
          setDebugInfo({
            stage: "server_function",
            error: funcError,
          });
          throw new Error(funcError.message);
        }

        if (funcResult && funcResult.success) {
          // Server function worked! Now update the image URLs if needed
          if (idImageUrl || licenseImageUrl) {
            const updateData = {};
            if (idImageUrl) updateData.id_image = idImageUrl;
            if (licenseImageUrl) updateData.license_image = licenseImageUrl;

            await supabase.from("drivers").update(updateData).eq("id", userId);
          }

          setRegistrationComplete(true);
          toast.success(t("registrationSuccess") || "تم التسجيل بنجاح");
          return;
        } else {
          throw new Error("Server function did not return success");
        }
      } catch (serverFuncError) {
        console.warn(
          "Server function failed, falling back to direct inserts:",
          serverFuncError
        );
        // Continue with direct inserts below
      }

      // Step 4: Fall back to direct inserts if server function failed
      const profileData = {
        id: userId,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        email: data.email,
        user_type: "driver",
        birth_date: new Date(data.birthDate),
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .insert(profileData);

      if (profileError) {
        setDebugInfo({
          stage: "profile_insert",
          error: profileError,
          attempted_data: profileData,
        });

        toast.error("خطأ أثناء حفظ بيانات الحساب، يرجى المحاولة لاحقًا");
        setIsLoading(false);
        return;
      }

      const driverData = {
        id: userId,
        national_id: data.nationalId,
        license_number: data.licenseNumber,
        vehicle_info: data.vehicleInfo,
        status: "pending",
        is_available: false,
        // Add image URLs if available
        ...(idImageUrl && { id_image: idImageUrl }),
        ...(licenseImageUrl && { license_image: licenseImageUrl }),
      };

      const { error: driverInsertError } = await supabase
        .from("drivers")
        .insert(driverData);

      if (driverInsertError) {
        setDebugInfo({
          stage: "driver_insert",
          error: driverInsertError,
          attempted_data: driverData,
        });

        toast.error("خطأ أثناء حفظ بيانات السائق، يرجى المحاولة لاحقًا");
        setIsLoading(false);
        return;
      }

      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: "driver",
      });

      if (roleError) {
        console.error("Error assigning driver role:", roleError);
        toast.warning("تم إنشاء الحساب، لكن حدثت مشكلة في تعيين الدور");
      }

      setRegistrationComplete(true);
      toast.success(t("registrationSuccess") || "تم التسجيل بنجاح");
    } catch (error) {
      setDebugInfo({
        stage: "unexpected_error",
        error,
      });

      toast.error("حدث خطأ غير متوقع أثناء التسجيل، يرجى المحاولة مرة أخرى");
      setSubmitAttempts((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <img
            src="/lovable-uploads/921d22da-3d5c-4dd1-af5f-458968c49478.png"
            alt="SafeDrop Logo"
            className="mx-auto h-20 w-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-safedrop-primary mt-6">
            {t("registrationSuccess") || "تم التسجيل بنجاح"}
          </h2>
          <p className="mt-4 text-gray-600">
            {language === "ar"
              ? "شكراً لتسجيلك في سيف دروب. تم إرسال رسالة تأكيد إلى بريدك الإلكتروني."
              : "Thank you for registering with SafeDrop. A confirmation email has been sent to your email."}
          </p>
          <p className="mt-4 text-gray-600">
            {language === "ar"
              ? "بعد تأكيد بريدك الإلكتروني، سيتم مراجعة طلبك كسائق من قبل فريقنا."
              : "After confirming your email, your driver application will be reviewed by our team."}
          </p>
          <div className="mt-8">
            <Button
              onClick={() => navigate("/login")}
              className="bg-safedrop-gold hover:bg-safedrop-gold/90"
            >
              {t("login") || "تسجيل الدخول"}
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
                          min="1990"
                          max={new Date().getFullYear() + 1}
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

            {/* Document Uploads */}
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
