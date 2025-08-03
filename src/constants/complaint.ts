// Constants for complaint form
export const COMPLAINT_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: [
    "image/jpeg",
    "image/png", 
    "image/gif",
    "application/pdf",
    "text/plain",
  ],
  STORAGE_BUCKET: "complaint-attachments",
  CACHE_CONTROL: "3600",
  MIN_DESCRIPTION_LENGTH: 10,
} as const;

export const ISSUE_TYPE_KEYS = [
  { value: "login", labelKey: "issueTypeLogin" },
  { value: "order", labelKey: "issueTypeOrder" },
  { value: "payment", labelKey: "issueTypePayment" },
  { value: "customer", labelKey: "issueTypeCustomer" },
  { value: "other", labelKey: "issueTypeOther" },
] as const;

export const COMPLAINT_STATUS = {
  PENDING: "pending",
  RESOLVED: "resolved",
  IN_PROGRESS: "in_progress",
} as const;

export const NOTIFICATION_TYPES = {
  COMPLAINT_CONFIRMATION: "complaint_confirmation",
  NEW_COMPLAINT: "complaint",
} as const;
