import { useState } from "react";
import { useLanguage } from "@/components/ui/language-context";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, Globe, Shield, Moon } from "lucide-react";
import { DriverPageLayout, DriverFormCard } from "@/components/driver/common";

const DriverSettingsContent = () => {
  const { t, language, setLanguage } = useLanguage();
  const [notifications, setNotifications] = useState({
    orders: true,
    messages: true,
    earnings: true,
    updates: false,
  });
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveChanges = () => {
    // Handle save logic here
    console.log('Settings saved:', { notifications, darkMode, language });
  };

  return (
    <DriverPageLayout 
      title={t("settings")}
      headerActions={
        <Button 
          className="bg-safedrop-gold hover:bg-safedrop-gold/90"
          onClick={handleSaveChanges}
        >
          {t("saveChanges")}
        </Button>
      }
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <DriverFormCard
          title={t("notificationSettings")}
          icon={Bell}
          showActions={false}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t("orderNotifications")}</p>
                <p className="text-sm text-gray-500">
                  {t("receiveOrderNotifications")}
                </p>
              </div>
              <Switch
                checked={notifications.orders}
                onCheckedChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    orders: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t("messageNotifications")}</p>
                <p className="text-sm text-gray-500">
                  {t("receiveMessageNotifications")}
                </p>
              </div>
              <Switch
                checked={notifications.messages}
                onCheckedChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    messages: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {t("earningsNotifications")}
                </p>
                <p className="text-sm text-gray-500">
                  {t("receiveEarningsNotifications")}
                </p>
              </div>
              <Switch
                checked={notifications.earnings}
                onCheckedChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    earnings: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t("systemNotifications")}</p>
                <p className="text-sm text-gray-500">
                  {t("receiveUpdateNotifications")}
                </p>
              </div>
              <Switch
                checked={notifications.updates}
                onCheckedChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    updates: checked,
                  })
                }
              />
            </div>
          </div>
        </DriverFormCard>

        <DriverFormCard
          title={t("languageSettings")}
          icon={Globe}
          showActions={false}
        >
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("preferredLanguage")}
            </label>
            <select
              dir={language === "ar" ? "rtl" : "ltr"}
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
        </DriverFormCard>
      </div>
    </DriverPageLayout>
  );
};
const DriverSettings = () => {
  return <DriverSettingsContent />;
};
export default DriverSettings;
