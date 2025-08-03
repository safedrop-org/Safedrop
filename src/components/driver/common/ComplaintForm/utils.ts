import { IssueType } from './types';

export const getIssueTypes = (t: (key: string) => string): IssueType[] => [
  { value: "login", label: t("issueTypeLogin") },
  { value: "order", label: t("issueTypeOrder") },
  { value: "payment", label: t("issueTypePayment") },
  { value: "driver", label: t("issueTypeDriver") },
  { value: "other", label: t("issueTypeOther") },
];

export const getIssueTypeLabel = (type: string, t: (key: string) => string) => {
  const types = {
    login: t("issueTypeLogin"),
    order: t("issueTypeOrder"),
    payment: t("issueTypePayment"),
    driver: t("issueTypeDriver"),
    other: t("issueTypeOther"),
  };
  return types[type as keyof typeof types] || type;
};

export const validateFile = (file: File, t: (key: string) => string): string | null => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png", 
    "image/gif",
    "application/pdf",
    "text/plain",
  ];

  if (file.size > MAX_FILE_SIZE) {
    return t("fileTooLarge");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return t("unsupportedFileType");
  }

  return null;
};
