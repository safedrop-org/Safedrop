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
  Upload,
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
  id_image: z.any().refine((file) => file instanceof File, {
    message: "صورة الهوية مطلوبة",
  }),
  license_image: z.any().refine((file) => file instanceof File, {
    message: "صورة الرخصة مطلوبة",
  }),
});

type DriverFormValues = z.infer<typeof driverRegisterSchema>;

const DriverRegisterContent = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);

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
      id_image: null,
      license_image: null,
    },
  });

  const uploadFile = async (file, folder, userId) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}_${folder}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Try uploading with current session first
    let uploadError;
    const uploadData = await supabase.storage
      .from("driver-documents")
      .upload(filePath, file);

    if (uploadData.error) {
      // If upload fails due to authentication, try with service role
      // Note: This requires additional backend endpoint or policy changes
      uploadError = uploadData.error;
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("driver-documents").getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (data) => {
    if (isLoading) return;

    setIsLoading(true);
    setRegistrationError(null);

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
              birth_date: data.birthDate,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        }
      );

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("فشل إنشاء حساب المستخدم");

      const userId = authData.user.id;

      // Step 2: Upload files
      setUploadingFiles(true);
      const [idCardUrl, licenseUrl] = await Promise.all([
        uploadFile(data.id_image, "id-cards", userId),
        uploadFile(data.license_image, "licenses", userId),
      ]);

      // Step 3: Store pending user details in cookie
      const pendingUserDetails = {
        id: userId,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        email: data.email,
        user_type: "driver",
        birth_date: data.birthDate,
        national_id: data.nationalId,
        license_number: data.licenseNumber,
        vehicle_info: data.vehicleInfo,
        id_card_url: idCardUrl,
        license_url: licenseUrl,
      };

      // Store in cookie with 1 hour expiry
      Cookies.set("pendingUserDetails", JSON.stringify(pendingUserDetails), {
        expires: 1 / 24,
        secure: true,
        sameSite: "strict",
      });

      setRegistrationComplete(true);
    } catch (error) {
      const errorMsg =
        error.message?.includes("duplicate key") ||
        error.message?.includes("already registered")
          ? "هذا البريد الإلكتروني مسجل بالفعل"
          : error.message || t("registrationError");

      setRegistrationError(errorMsg);
      toast.error(t("registrationError"), { description: error.message });
    } finally {
      setIsLoading(false);
      setUploadingFiles(false);
    }
  };

  const FileUploadField = ({
    field,
    label,
    icon: Icon,
    accept = "image/*",
  }) => (
    <FormItem>
      <FormLabel className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </FormLabel>
      <FormControl>
        <div className="relative">
          <Input
            type="file"
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              field.onChange(file);
            }}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-safedrop-gold/10 file:text-safedrop-primary hover:file:bg-safedrop-gold/20"
          />
          {field.value && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              {field.value.name}
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );

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
            {language === "ar"
              ? "شكراً لتسجيلك في سيف دروب. تم إرسال رسالة تأكيد إلى بريدك الإلكتروني."
              : "Thank you for registering with SafeDrop. A confirmation email has been sent to your email."}
          </p>
          <p className="mt-2 text-gray-600">
            {language === "ar"
              ? "بعد تأكيد بريدك الإلكتروني، سيتم مراجعة طلبك كسائق من قبل فريقنا."
              : "After confirming your email, your driver application will be reviewed by our team."}
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
            {t("driverRegister")}
          </h2>
        </div>

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
              <h3 className="text-lg font-semibold text-gray-900">
                المعلومات الشخصية
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("firstName")}</FormLabel>
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
                    <FormItem>
                      <FormLabel>{t("lastName")}</FormLabel>
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
                    <FormLabel>{t("birthDate")}</FormLabel>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("email")}</FormLabel>
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
                      <FormLabel>{t("phone")}</FormLabel>
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
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password")}</FormLabel>
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
              <h3 className="text-lg font-semibold text-gray-900">
                معلومات السائق
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nationalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("nationalId")}</FormLabel>
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
                      <FormLabel>{t("licenseNumber")}</FormLabel>
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
              <h3 className="text-lg font-semibold text-gray-900">
                معلومات المركبة
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleInfo.make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("vehicleMake")}</FormLabel>
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
                      <FormLabel>{t("vehicleModel")}</FormLabel>
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
                      <FormLabel>{t("vehicleYear")}</FormLabel>
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
                      <FormLabel>{t("plateNumber")}</FormLabel>
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
              <h3 className="text-lg font-semibold text-gray-900">
                المستندات المطلوبة
              </h3>

              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="id_image"
                  render={({ field }) => (
                    <FileUploadField
                      field={field}
                      label={
                        language === "ar"
                          ? "صورة الهوية الوطنية"
                          : "National ID Card"
                      }
                      icon={CreditCard}
                      accept="image/*"
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="license_image"
                  render={({ field }) => (
                    <FileUploadField
                      field={field}
                      label={
                        language === "ar"
                          ? "صورة رخصة القيادة"
                          : "Driving License"
                      }
                      icon={FileText}
                      accept="image/*"
                    />
                  )}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
              disabled={isLoading || uploadingFiles}
            >
              {uploadingFiles
                ? language === "ar"
                  ? "جاري رفع المستندات..."
                  : "Uploading documents..."
                : isLoading
                ? t("registering")
                : t("register")}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-4">
          {t("alreadyHaveAccount")}{" "}
          <Link to="/login" className="text-safedrop-gold hover:underline">
            {t("login")}
          </Link>
        </div>
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
