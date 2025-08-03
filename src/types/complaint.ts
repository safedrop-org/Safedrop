// Types for complaint form and data
export interface ComplaintFormData {
  issue_type: string;
  description: string;
  order_number?: string;
}

export interface ComplaintData extends ComplaintFormData {
  user_id: string;
  attachment_url?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ComplaintFormValues {
  issue_type: string;
  description: string;
  order_number: string;
}

export interface IssueType {
  value: string;
  label: string;
}

export interface AdminUser {
  id: string;
}

export interface UserProfile {
  email: string;
  first_name: string;
  last_name: string;
}
