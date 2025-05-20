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
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}_${folder}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("driver-documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
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

  const createDriverRecord = async (userData, idCardUrl, licenseUrl) => {
    try {
      // Insert driver record into drivers table
      const { data: driverData, error: driverError } = await supabase
        .from("drivers")
        .insert({
          user_id: userData.userId,
          national_id: userData.nationalId,
          license_number: userData.licenseNumber,
          license_expiry: null, // You may want to add this field to the form
          vehicle_make: userData.vehicleInfo.make,
          vehicle_model: userData.vehicleInfo.model,
          vehicle_year: parseInt(userData.vehicleInfo.year),
          vehicle_plate: userData.vehicleInfo.plateNumber,
          id_card_url: idCardUrl,
          license_url: licenseUrl,
          status: "pending", // Default status for new drivers
          rejection_reason: null,
          is_available: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (driverError) {
        console.error("Driver creation error:", driverError);
        throw new Error(
          `Failed to create driver record: ${driverError.message}`
        );
      }

      return driverData;
    } catch (error) {
      console.error("Driver record creation failed:", error);
      throw error;
    }
  };

  const onSubmit = async (data) => {
    if (isLoading) return;

    setIsLoading(true);
    setRegistrationError(null);
    let userId = null;

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

      if (signUpError) {
        console.error("Sign up error:", signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error("فشل إنشاء حساب المستخدم");
      }

      userId = authData.user.id;

      // Step 2: Upload files
      setUploadingFiles(true);

      let idCardUrl, licenseUrl;

      try {
        [idCardUrl, licenseUrl] = await Promise.all([
          uploadFile(data.id_image, "id-cards", userId),
          uploadFile(data.license_image, "licenses", userId),
        ]);
      } catch (uploadError) {
        console.error("File upload failed:", uploadError);
        // If file upload fails, we should clean up the created user
        await supabase.auth.admin.deleteUser(userId);
        throw new Error(`فشل في رفع المستندات: ${uploadError.message}`);
      }

      // Step 3: Create driver record
      try {
        const driverRecord = await createDriverRecord(
          {
            userId,
            nationalId: data.nationalId,
            licenseNumber: data.licenseNumber,
            vehicleInfo: data.vehicleInfo,
          },
          idCardUrl,
          licenseUrl
        );

        console.log("Driver record created:", driverRecord);
      } catch (driverError) {
        console.error("Driver record creation failed:", driverError);
        // Clean up uploaded files and user account if driver record fails
        try {
          await supabase.storage
            .from("driver-documents")
            .remove([
              `id-cards/${userId}_id-cards_${Date.now()}.${data.id_image.name
                .split(".")
                .pop()}`,
              `licenses/${userId}_licenses_${Date.now()}.${data.license_image.name
                .split(".")
                .pop()}`,
            ]);
          await supabase.auth.admin.deleteUser(userId);
        } catch (cleanupError) {
          console.error("Cleanup failed:", cleanupError);
        }
        throw new Error(`فشل في إنشاء سجل السائق: ${driverError.message}`);
      }

      // Step 4: Update user profile with additional info
      try {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: userId,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          email: data.email,
          user_type: "driver",
          birth_date: data.birthDate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error("Profile update error:", profileError);
          // This is not critical, so we'll just log it
        }
      } catch (profileError) {
        console.error("Profile creation failed:", profileError);
        // This is not critical, so we'll continue
      }

      setRegistrationComplete(true);

      toast.success(
        language === "ar"
          ? "تم إنشاء حسابك بنجاح! يرجى تأكيد البريد الإلكتروني."
          : "Account created successfully! Please confirm your email."
      );
    } catch (error) {
      console.error("Registration error:", error);

      let errorMsg = "حدث خطأ أثناء التسجيل";

      if (
        error.message?.includes("duplicate key") ||
        error.message?.includes("already registered") ||
        error.message?.includes("User already registered")
      ) {
        errorMsg = "هذا البريد الإلكتروني مسجل بالفعل";
      } else if (error.message?.includes("Invalid email")) {
        errorMsg = "البريد الإلكتروني غير صالح";
      } else if (error.message?.includes("Password")) {
        errorMsg = "كلمة المرور غير صالحة";
      } else if (error.message?.includes("Upload failed")) {
        errorMsg = "فشل في رفع المستندات، يرجى المحاولة مرة أخرى";
      } else if (error.message) {
        errorMsg = error.message;
      }

      setRegistrationError(errorMsg);
      toast.error("خطأ في التسجيل", {
        description: errorMsg,
        duration: 5000,
      });
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
              if (file) {
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                  toast.error("حجم الملف كبير جداً، الحد الأقصى 5 ميجابايت");
                  return;
                }
                // Validate file type
                if (!file.type.startsWith("image/")) {
                  toast.error("يجب أن يكون الملف صورة");
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
                ({(field.value.size / 1024 / 1024).toFixed(2)} MB)
              </span>
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
          <div className="space-y-3 text-gray-600">
            <p>
              {language === "ar"
                ? "شكراً لتسجيلك في سيف دروب. تم إرسال رسالة تأكيد إلى بريدك الإلكتروني."
                : "Thank you for registering with SafeDrop. A confirmation email has been sent to your email."}
            </p>
            <p>
              {language === "ar"
                ? "بعد تأكيد بريدك الإلكتروني، سيتم مراجعة طلبك كسائق من قبل فريقنا خلال 24-48 ساعة."
                : "After confirming your email, your driver application will be reviewed by our team within 24-48 hours."}
            </p>
            <p className="text-sm text-amber-600">
              {language === "ar"
                ? "ستتلقى إشعاراً عبر البريد الإلكتروني بنتيجة المراجعة."
                : "You will receive an email notification with the review result."}
            </p>
          </div>
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
      <div className="max-w-2xl w-full space-y-8 bg-white shadow-lg rounded-xl p-8">
        <div className="text-center">
          <img
            alt="SafeDrop Logo"
            className="mx-auto h-20 w-auto mb-4"
            src="/api/placeholder/80/80"
          />
          <h2 className="text-3xl font-bold text-safedrop-primary">
            {t("driverRegister") || "تسجيل السائق"}
          </h2>
          <p className="mt-2 text-gray-600">
            {language === "ar"
              ? "املأ جميع البيانات المطلوبة لتسجيل حساب سائق جديد"
              : "Fill in all required information to register as a driver"}
          </p>
        </div>

        {registrationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-2 items-center">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{registrationError}</p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                المعلومات الشخصية
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("firstName") || "الاسم الأول"}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                      <FormLabel>{t("lastName") || "اسم العائلة"}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input type="date" className="pl-10" {...field} />
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
                      <FormLabel>{t("email") || "البريد الإلكتروني"}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                          <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                    <FormLabel>{t("password") || "كلمة المرور"}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                معلومات السائق
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90 disabled:opacity-50"
              disabled={isLoading || uploadingFiles}
              size="lg"
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

        <div className="text-center mt-6 pt-4 border-t">
          <p className="text-gray-600">
            {t("alreadyHaveAccount") || "هل لديك حساب بالفعل؟"}{" "}
            <Link
              to="/login"
              className="text-safedrop-gold hover:underline font-medium"
            >
              {t("login") || "تسجيل الدخول"}
            </Link>
          </p>
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
