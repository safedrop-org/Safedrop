import { useLanguage } from "@/components/ui/language-context";
import { AdminLayoutWithHeader, AdminCard } from "@/components/admin";
import { Globe } from "lucide-react";

const AdminSettings = () => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <AdminLayoutWithHeader title={t("settings")}>
      <div className="max-w-3xl mx-auto space-y-6">
        <AdminCard
          title={t("languageSettings")}
          icon={<Globe className="h-5 w-5" />}
        >
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
        </AdminCard>
      </div>
    </AdminLayoutWithHeader>
  );
};

export default AdminSettings;
