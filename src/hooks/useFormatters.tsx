import { useLanguage } from "@/components/ui/language-context";

/**
 * Format date based on current language
 */
export const useFormatDate = () => {
  const { language } = useLanguage();

  const formatDate = (dateString: string | null, options?: Intl.DateTimeFormatOptions) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    };

    return new Intl.DateTimeFormat(
      language === "ar" ? "ar-SA" : "en-US",
      defaultOptions
    ).format(date);
  };

  const formatDateTime = (dateString: string | null) => {
    return formatDate(dateString, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString: string | null) => {
    return formatDate(dateString, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTimeOnly = (dateString: string | null) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(
      language === "ar" ? "ar-SA" : "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(date);
  };

  return {
    formatDate,
    formatDateTime,
    formatDateOnly,
    formatTimeOnly,
  };
};

/**
 * Format currency based on current language
 */
export const useFormatCurrency = () => {
  const { language, t } = useLanguage();

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) {
      return `0.00 ${t("currency")}`;
    }
    
    if (language === "ar") {
      return `${amount.toFixed(2)} ر.س`;
    }
    
    return `SAR ${amount.toFixed(2)}`;
  };

  return { formatCurrency };
};

/**
 * Format phone number for display
 */
export const useFormatPhone = () => {
  const getFormattedPhoneNumber = (phone?: string) => {
    const defaultPhone = "+966 55 616 0601";
    const phoneToFormat = phone || defaultPhone;
    
    return (
      <span className="inline-block" dir="ltr">
        &#x2066;{phoneToFormat}&#x2069;
      </span>
    );
  };

  return { getFormattedPhoneNumber };
};
