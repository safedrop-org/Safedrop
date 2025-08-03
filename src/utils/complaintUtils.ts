import { supabase } from "@/integrations/supabase/client";
import { COMPLAINT_CONSTANTS } from "@/constants/complaint";
import { toast } from "sonner";

// File upload utility
export const handleFileUpload = async (
  file: File,
  userId: string,
  setUploadProgress: (progress: number) => void,
  t: (key: string) => string
): Promise<string | null> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${COMPLAINT_CONSTANTS.STORAGE_BUCKET}/${fileName}`;

    setUploadProgress(10);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(COMPLAINT_CONSTANTS.STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: COMPLAINT_CONSTANTS.CACHE_CONTROL,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    setUploadProgress(80);

    const { data: urlData } = supabase.storage
      .from(COMPLAINT_CONSTANTS.STORAGE_BUCKET)
      .getPublicUrl(filePath);

    setUploadProgress(100);

    if (urlData?.publicUrl) {
      return urlData.publicUrl;
    }

    throw new Error("Failed to get public URL");
  } catch (error) {
    console.error("Error uploading file:", error);
    toast.error(t("fileUploadError"));
    return null;
  }
};

// File validation utility
export const validateFile = (
  file: File,
  t: (key: string) => string
): boolean => {
  if (file.size > COMPLAINT_CONSTANTS.MAX_FILE_SIZE) {
    toast.error(t("fileTooLarge"));
    return false;
  }

  const allowedTypes = COMPLAINT_CONSTANTS.ALLOWED_FILE_TYPES as readonly string[];
  if (!allowedTypes.includes(file.type)) {
    toast.error(t("unsupportedFileType"));
    return false;
  }

  return true;
};

// Get issue type label utility
export const getIssueTypeLabel = (
  type: string,
  t: (key: string) => string
): string => {
  const types = {
    login: t("issueTypeLogin"),
    order: t("issueTypeOrder"),
    payment: t("issueTypePayment"),
    customer: t("issueTypeCustomer"),
    other: t("issueTypeOther"),
  };
  return types[type as keyof typeof types] || type;
};
