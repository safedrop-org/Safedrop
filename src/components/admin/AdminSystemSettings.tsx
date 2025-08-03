import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useLanguage } from "@/components/ui/language-context";

interface AdminSystemSettingsProps {
  selectedCommissionRate: number;
  setSelectedCommissionRate: (rate: number) => void;
  systemLanguage: string;
  privacyPolicy: string;
  setPrivacyPolicy: (policy: string) => void;
  termsOfService: string;
  setTermsOfService: (terms: string) => void;
  onUpdateCommissionRate: () => void;
  onUpdateSystemLanguage: (language: string) => void;
  onUpdatePrivacyPolicy: () => void;
  onUpdateTermsOfService: () => void;
}

/**
 * AdminSystemSettings - مكون إعدادات النظام في لوحة الإدارة
 * يحتوي على إعدادات العمولات واللغة وسياسة الخصوصية وشروط الخدمة
 */
const AdminSystemSettings: React.FC<AdminSystemSettingsProps> = ({
  selectedCommissionRate,
  setSelectedCommissionRate,
  systemLanguage,
  privacyPolicy,
  setPrivacyPolicy,
  termsOfService,
  setTermsOfService,
  onUpdateCommissionRate,
  onUpdateSystemLanguage,
  onUpdatePrivacyPolicy,
  onUpdateTermsOfService
}) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {t("systemSettings")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="commissions" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="commissions">
              {t("commissions")}
            </TabsTrigger>
            <TabsTrigger value="language">
              {t("language")}
            </TabsTrigger>
            <TabsTrigger value="privacy">
              {t("privacyPolicy")}
            </TabsTrigger>
            <TabsTrigger value="terms">
              {t("termsOfService")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="commissions">
            <div className="space-y-4">
              <div>
                <Label htmlFor="commission-rate">
                  {t("commissionRatePercentage")}
                </Label>
                <div className="flex items-center gap-4 mt-1">
                  <Input
                    id="commission-rate"
                    type="number"
                    min="0"
                    max="100"
                    value={selectedCommissionRate.toString()}
                    onChange={(e) =>
                      setSelectedCommissionRate(Number(e.target.value))
                    }
                    className="w-[100px]"
                  />
                  <Button onClick={onUpdateCommissionRate}>
                    <Check className="h-4 w-4 mr-2" />
                    {t("save")}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="language">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t("systemLanguage")}</Label>
                <div className="flex gap-4">
                  <Button
                    variant={systemLanguage === "ar" ? "default" : "outline"}
                    onClick={() => onUpdateSystemLanguage("ar")}
                  >
                    {t("arabic")}
                  </Button>
                  <Button
                    variant={systemLanguage === "en" ? "default" : "outline"}
                    onClick={() => onUpdateSystemLanguage("en")}
                  >
                    {t("english")}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="privacy">
            <div className="space-y-4">
              <div>
                <Label htmlFor="privacy-policy">
                  {t("privacyPolicy")}
                </Label>
                <Input
                  id="privacy-policy"
                  type="text"
                  value={privacyPolicy}
                  onChange={(e) => setPrivacyPolicy(e.target.value)}
                  className="w-full mt-1"
                />
                <Button onClick={onUpdatePrivacyPolicy} className="mt-2">
                  <Check className="h-4 w-4 mr-2" />
                  {t("save")}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="terms">
            <div className="space-y-4">
              <div>
                <Label htmlFor="terms-of-service">
                  {t("termsOfService")}
                </Label>
                <Input
                  id="terms-of-service"
                  type="text"
                  value={termsOfService}
                  onChange={(e) => setTermsOfService(e.target.value)}
                  className="w-full mt-1"
                />
                <Button onClick={onUpdateTermsOfService} className="mt-2">
                  <Check className="h-4 w-4 mr-2" />
                  {t("save")}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminSystemSettings;
