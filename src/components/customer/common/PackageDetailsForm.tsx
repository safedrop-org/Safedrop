import React from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { useLanguage } from "@/components/ui/language-context";

interface PackageDetailsFormProps {
  packageDetails: string;
  notes: string;
  estimatedCost: number | null;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const PackageDetailsForm: React.FC<PackageDetailsFormProps> = ({
  packageDetails,
  notes,
  estimatedCost,
  onChange,
}) => {
  const { t, language } = useLanguage();

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex gap-2 items-center">
        <Package className="h-5 w-5 ml-2 text-safedrop-gold" />
        {t("shipmentDetails")}
      </h2>
      <div className="space-y-4">
        {estimatedCost && (
          <div className="mb-4">
            <p className="text-sm text-blue-600 font-medium">
              {language === "ar"
                ? `التكلفة المقدرة: ${estimatedCost} ر.س`
                : `Estimated cost: ${estimatedCost} SAR`}
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="packageDetails">{t("packageDescription")}</Label>
          <Textarea
            id="packageDetails"
            name="packageDetails"
            placeholder={t("contentsSizeWeight")}
            rows={3}
            value={packageDetails}
            onChange={onChange}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="notes">{t("driverNotes")}</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder={t("specialInstructions")}
            rows={3}
            value={notes}
            onChange={onChange}
          />
        </div>
      </div>
    </Card>
  );
};

export default PackageDetailsForm;
