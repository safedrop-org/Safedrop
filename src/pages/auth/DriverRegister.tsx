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
    toast.error(
      "تم تجاوز الحد المسموح للتسجيل، يرجى الانتظار دقيقة واحدة قبل المحاولة مرة أخرى"
    );
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

  // Upload files directly to Supabase Storage
  const uploadFilesToSupabase = async (userId) => {
    const uploadResults = {};
    try {
      // Upload ID image if exists
      if (idImageFile) {
        const fileExt = idImageFile.name.split(".").pop();
        const fileName = `${userId}_id_image_${Date.now()}.${fileExt}`;
        const filePath = `id-cards/${fileName}`;

        const { error: idUploadError } = await supabase.storage
          .from("driver-documents")
          .upload(filePath, idImageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (!idUploadError) {
          // Get public URL
          const { data: idImageData } = supabase.storage
            .from("driver-documents")
            .getPublicUrl(filePath);

          uploadResults.id_image = idImageData.publicUrl;
        } else {
          console.error("Error uploading ID image:", idUploadError);
        }
      }

      // Upload license image if exists
      if (licenseImageFile) {
        const fileExt = licenseImageFile.name.split(".").pop();
        const fileName = `${userId}_license_image_${Date.now()}.${fileExt}`;
        const filePath = `licenses/${fileName}`;

        const { error: licenseUploadError } = await supabase.storage
          .from("driver-documents")
          .upload(filePath, licenseImageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (!licenseUploadError) {
          // Get public URL
          const { data: licenseImageData } = supabase.storage
            .from("driver-documents")
            .getPublicUrl(filePath);

          uploadResults.license_image = licenseImageData.publicUrl;
        } else {
          console.error("Error uploading license image:", licenseUploadError);
        }
      }

      return uploadResults;
    } catch (error) {
      console.error("Error uploading files:", error);
      return uploadResults;
    }
  };

  // Store file data in localStorage as backup
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

  // Create driver record directly
  const createDriverRecord = async (userId, data, imageUrls) => {
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

  const onSubmit = async (data: DriverFormValues) => {
    if (waitTime > 0) {
      toast.error(`يرجى الانتظار ${waitTime} ثانية قبل المحاولة مرة أخرى`);
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
        toast.error("فشل إنشاء الحساب، يرجى المحاولة مرة أخرى");
        setIsLoading(false);
        return;
      }

      // Step 2: Upload files directly to storage
      const imageUrls = await uploadFilesToSupabase(authData.user.id);

      // Step 3: Create driver record in the database
      const driverCreated = await createDriverRecord(
        authData.user.id,
        data,
        imageUrls
      );

      if (!driverCreated) {
        // Store files in localStorage as backup for the auth callback to process
        storeFileData(authData.user.id, idImageFile, licenseImageFile);
      }

      // Step 4: Store user's pending details in a cookie for auth callback
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
      toast.error("حدث خطأ غير متوقع أثناء التسجيل، يرجى المحاولة مرة أخرى");
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
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <img
            src="/lovable-uploads/921d22da-3d5c-4dd1-af5f-458968c49478.png"
            alt="SafeDrop Logo"
            className="mx-auto h-20 w-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-safedrop-primary mt-6">
            {t("registrationSuccess")}
          </h2>
          <p className="mt-4 text-gray-600">
            {language === "ar"
              ? "شكراً لتسجيلك في سيف دروب. تم إرسال رسالة تأكيد إلى بريدك الإلكتروني."
              : "Thank you for registering with SafeDrop. A confirmation email has been sent to your email."}
          </p>
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
          </div>
        )}

        {debugInfo && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 text-xs">
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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
                          language === "ar" ? "موديل السيارة" : "Vehicle Model"
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

            {/* ID Image Upload */}
            <FormItem>
              <FormLabel>
                {language === "ar" ? "صورة الهوية" : "ID Image"}
              </FormLabel>
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
                        {language === "ar"
                          ? "انقر لتغيير الصورة"
                          : "Click to change image"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {language === "ar"
                          ? "اضغط لتحميل صورة الهوية"
                          : "Click to upload ID image"}
                      </span>
                    </>
                  )}
                </label>
              </div>
            </FormItem>

            {/* License Image Upload */}
            <FormItem>
              <FormLabel>
                {language === "ar"
                  ? "صورة رخصة القيادة"
                  : "Driver License Image"}
              </FormLabel>
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
                        {language === "ar"
                          ? "انقر لتغيير الصورة"
                          : "Click to change image"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {language === "ar"
                          ? "اضغط لتحميل صورة الرخصة"
                          : "Click to upload license image"}
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
