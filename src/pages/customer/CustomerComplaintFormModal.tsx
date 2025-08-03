import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useLanguage } from "@/components/ui/language-context";
import { ISSUE_TYPE_KEYS, COMPLAINT_CONSTANTS, COMPLAINT_STATUS } from "@/constants/complaint";
import { handleFileUpload, validateFile, getIssueTypeLabel } from "@/utils/complaintUtils";
import { createComplaintNotifications, sendComplaintEmailNotification } from "@/utils/complaintNotifications";
import { ComplaintFormValues } from "@/types/complaint";

const CustomerComplaintFormModal = ({ trigger }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Dynamic schema with translations
  const complaintSchema = z.object({
    issue_type: z.string().min(1, { message: t("issueTypeRequired") }),
    description: z
      .string()
      .min(COMPLAINT_CONSTANTS.MIN_DESCRIPTION_LENGTH, { message: t("problemDescriptionRequired") }),
    order_number: z.string().optional(),
  });

  type ComplaintFormValues = z.infer<typeof complaintSchema>;

  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      issue_type: "",
      description: "",
      order_number: "",
    },
  });

  const issueTypes = ISSUE_TYPE_KEYS.map((issueType) => ({
    value: issueType.value,
    label: t(issueType.labelKey),
  }));

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file, t)) {
      setUploadedFile(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
  };

  const onSubmit = async (data: ComplaintFormValues) => {
    if (!user?.id) {
      toast.error(t("loginRequired"));
      return;
    }

    setIsLoading(true);

    try {
      let attachmentUrl = null;

      if (uploadedFile) {
        setUploadProgress(0);
        attachmentUrl = await handleFileUpload(uploadedFile, user.id, setUploadProgress, t);
        if (!attachmentUrl) {
          setIsLoading(false);
          return;
        }
      }

      const complaintData = {
        user_id: user.id,
        issue_type: data.issue_type,
        description: data.description,
        order_number: data.order_number || null,
        attachment_url: attachmentUrl,
        status: COMPLAINT_STATUS.PENDING,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: complaint, error: complaintError } = await supabase
        .from("complaints")
        .insert(complaintData)
        .select()
        .single();

      // Send email notification
      await sendComplaintEmailNotification(complaint, user.id, language);

      if (complaintError) {
        console.error("Error creating complaint:", complaintError);
        throw complaintError;
      }

      const { data: userProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      const userName = userProfile
        ? `${userProfile.first_name} ${userProfile.last_name}`
        : t("defaultUserName");

      // Create notifications
      await createComplaintNotifications(complaintData, userName, user.id, t);

      toast.success(t("complaintSubmittedSuccess"));

      setUploadedFile(null);
      setUploadProgress(0);
      setIsOpen(false);
    } catch (error) {
      console.error("Error submitting complaint:", error);

      if (error.message?.includes("row-level security")) {
        toast.error(t("permissionError"));
      } else if (error.message?.includes("violates")) {
        toast.error(t("dataValidationError"));
      } else {
        toast.error(t("genericSubmissionError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {t("reportProblem")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Issue Type */}
            <FormField
              control={form.control}
              name="issue_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t("issueType")}{" "}
                    <span className="text-red-500">{t("requiredField")}</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectIssueType")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {issueTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Order Number */}
            <FormField
              control={form.control}
              name="order_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t("orderNumber")}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t("enterOrderNumber")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t("problemDescription")}{" "}
                    <span className="text-red-500">{t("requiredField")}</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("describeProblemPlaceholder")}
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("attachFile")}</label>

              {!uploadedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    onChange={onFileChange}
                    accept="image/*,.pdf,.txt"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {t("clickToSelectFile")}
                    </span>
                    <span className="text-xs text-gray-500">
                      {t("supportedFileTypes")}
                    </span>
                  </label>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">
                        {uploadedFile.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="h-auto p-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {t("uploadingFile")} {uploadProgress}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Info Message */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">{t("reviewInfoMessage")}</p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
                disabled={isLoading}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-safedrop-gold hover:bg-safedrop-gold/90"
                disabled={isLoading}
              >
                {isLoading ? t("submitting") : t("submitComplaint")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerComplaintFormModal;
