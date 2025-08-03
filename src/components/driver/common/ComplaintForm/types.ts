import * as z from "zod";

export interface IssueType {
  value: string;
  label: string;
}

export interface ComplaintFormModalProps {
  trigger: React.ReactNode;
}

export const createComplaintSchema = (t: (key: string) => string) => z.object({
  issue_type: z.string().min(1, { message: t("issueTypeRequired") }),
  description: z
    .string()
    .min(10, { message: t("problemDescriptionRequired") }),
  order_number: z.string().optional(),
});

export type ComplaintFormValues = z.infer<ReturnType<typeof createComplaintSchema>>;

export interface FileUploadState {
  file: File | null;
  progress: number;
}

export interface ComplaintData {
  user_id: string;
  issue_type: string;
  description: string;
  order_number?: string | null;
  attachment_url?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}
