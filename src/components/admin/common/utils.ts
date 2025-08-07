// Common utility functions for admin components

export const formatDate = (dateString: string | undefined, language: string, t: (key: string) => string) => {
  if (!dateString) return t("notSpecified");
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t("invalidDate");
    return date.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return t("invalidDate");
  }
};

export const formatDateWithTime = (dateString: string | undefined, language: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(
    language === "ar" ? "ar-SA" : "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

export const formatCurrency = (value: number, t: (key: string) => string) => {
  if (value === undefined || value === null) return `0 ${t("currency")}`;
  return `${value.toLocaleString()} ${t("currency")}`;
};

export const getUserName = (
  user: { first_name?: string; last_name?: string } | undefined,
  t: (key: string) => string
) => {
  if (!user) return t("notAvailable");
  const firstName = user.first_name || "";
  const lastName = user.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || t("notAvailable");
};

export const getStatusBadgeStyle = (
  status: string,
  statusCategories: Array<{ name: string; color: string }>
) => {
  const category = statusCategories.find((cat) => cat.name === status);
  const color = category ? category.color : "#6c757d";
  return {
    backgroundColor: color,
    color: "#ffffff",
    border: "none",
  };
};
