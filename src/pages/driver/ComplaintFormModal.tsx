import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useLanguage } from "@/components/ui/language-context";
import {
  FileUploadComponent,
  ComplaintFormModalProps,
  ComplaintFormValues,
  FileUploadState,
  ComplaintData,
  createComplaintSchema,
  getIssueTypes,
  validateFile,
  uploadFile,
  createNotifications,
  sendEmailNotification,
} from "@/components/driver/common/ComplaintForm";

const ComplaintFormModal: React.FC<ComplaintFormModalProps> = ({ trigger }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileState, setFileState] = useState<FileUploadState>({
    file: null,
    progress: 0,
  });

  const complaintSchema = createComplaintSchema(t);
  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      issue_type: "",
      description: "",
      order_number: "",
    },
  });

  const issueTypes = getIssueTypes(t);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateFile(file, t);
    if (error) {
      toast.error(error);
      return;
    }

    setFileState({ file, progress: 0 });
  };

  const handleRemoveFile = () => {
    setFileState({ file: null, progress: 0 });
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    if (!user?.id) return null;

    setFileState(prev => ({ ...prev, progress: 10 }));
    
    const url = await uploadFile(file, user.id);
    
    if (url) {
      setFileState(prev => ({ ...prev, progress: 100 }));
    } else {
      toast.error(t("fileUploadError"));
      setFileState(prev => ({ ...prev, progress: 0 }));
    }
    
    return url;
  };

  const onSubmit = async (data: ComplaintFormValues) => {
    if (!user?.id) {
      toast.error(t("loginRequired"));
      return;
    }

    setIsLoading(true);

    try {
      let attachmentUrl = null;

      // Upload file if exists
      if (fileState.file) {
        attachmentUrl = await handleFileUpload(fileState.file);
        if (!attachmentUrl) {
          setIsLoading(false);
          return;
        }
      }

      // Create complaint record
      const complaintData: ComplaintData = {
        user_id: user.id,
        issue_type: data.issue_type,
        description: data.description,
        order_number: data.order_number || null,
        attachment_url: attachmentUrl,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: complaint, error: complaintError } = await supabase
        .from("complaints")
        .insert(complaintData)
        .select()
        .single();

      if (complaintError) {
        console.error("Error creating complaint:", complaintError);
        throw complaintError;
      }

      // Send email notification
      await sendEmailNotification(complaint, user.id, language);

      // Get user profile for notifications
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      const userName = userProfile
        ? `${userProfile.first_name} ${userProfile.last_name}`
        : t("defaultUserName");

      // Create notifications
      await createNotifications(complaintData, userName, user.id, t);

      toast.success(t("complaintSubmittedSuccess"));

      // Reset form and close modal
      form.reset();
      setFileState({ file: null, progress: 0 });
      setIsOpen(false);
    } catch (error) {
      console.error("Error submitting complaint:", error);

      if (error instanceof Error) {
        if (error.message?.includes("row-level security")) {
          toast.error(t("permissionError"));
        } else if (error.message?.includes("violates")) {
          toast.error(t("dataValidationError"));
        } else {
          toast.error(t("genericSubmissionError"));
        }
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
              <FileUploadComponent
                fileState={fileState}
                onFileChange={handleFileChange}
                onRemoveFile={handleRemoveFile}
                t={t}
              />
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

export default ComplaintFormModal;
