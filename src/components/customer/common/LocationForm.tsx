import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/ui/language-context";

interface LocationType {
  address: string;
  details?: string;
}

interface LocationFormProps {
  type: "pickup" | "delivery";
  location: LocationType;
  onChange: (field: "address" | "details", value: string) => void;
}

const LocationForm: React.FC<LocationFormProps> = ({
  type,
  location,
  onChange,
}) => {
  const { t } = useLanguage();

  const isPickup = type === "pickup";
  const title = isPickup ? t("pickupInfo") : t("deliveryInfo");
  const addressLabel = isPickup ? t("pickupAddress") : t("deliveryAddress");
  const addressPlaceholder = isPickup
    ? t("enterPickupAddress")
    : t("enterDeliveryAddress");

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor={`${type}Address`}>{addressLabel}</Label>
            <Input
              id={`${type}Address`}
              placeholder={addressPlaceholder}
              value={location.address}
              onChange={(e) => onChange("address", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor={`${type}Details`}>{t("additionalDetails")}</Label>
            <Input
              id={`${type}Details`}
              placeholder={t("buildingNumFloor")}
              value={location.details}
              onChange={(e) => onChange("details", e.target.value)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LocationForm;
