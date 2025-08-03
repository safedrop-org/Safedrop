import { useState } from "react";
import { useLanguage } from "@/components/ui/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomerPageLayout from "@/components/customer/CustomerPageLayout";
import { useFormatPhone, useFormatCurrency } from "@/hooks/useFormatters";
import { Globe, Phone } from "lucide-react";
import { toast } from "sonner";

const CustomerSettingsContent = () => {
  const { t, language, setLanguage } = useLanguage();
  const { getFormattedPhoneNumber } = useFormatPhone();
  const { formatCurrency } = useFormatCurrency();
  const [loading, setLoading] = useState(false);

  const handleSaveChanges = () => {
    setLoading(true);
    // Simulate saving changes
    setTimeout(() => {
      setLoading(false);
      toast.success(t("settingsSaved"));
    }, 1000);
  };

  return (
    <CustomerPageLayout
      title={t("settings")}
      headerActions={
        <Button
          className="bg-safedrop-gold hover:bg-safedrop-gold/90"
          onClick={handleSaveChanges}
          disabled={loading}
        >
          {loading ? t("savingChanges") : t("saveChanges")}
        </Button>
      }
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t("languageSettings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("preferredLanguage")}
                </label>
                <select
                  className="w-full border rounded-md p-2"
                  value={language}
                  onChange={(e) =>
                    setLanguage(e.target.value as "ar" | "en")
                  }
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              {t("Support Contact")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-base font-medium">
                  {getFormattedPhoneNumber()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerPageLayout>
  );
};

const CustomerSettings = () => {
  return <CustomerSettingsContent />;
};

export default CustomerSettings;
