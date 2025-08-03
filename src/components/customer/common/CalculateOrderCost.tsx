import React from "react";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { useLanguage } from "@/components/ui/language-context";
import { useOrderCostCalculation } from "@/hooks/useOrderCostCalculation";

interface CalculateOrderCostProps {
  pickupLocation: string;
  dropoffLocation: string;
  onCostCalculated?: (cost: number) => void;
}

const CalculateOrderCost: React.FC<CalculateOrderCostProps> = ({
  pickupLocation,
  dropoffLocation,
  onCostCalculated,
}) => {
  const { language } = useLanguage();
  const {
    price,
    distance,
    duration,
    isCalculating,
    calculateOrderCost,
  } = useOrderCostCalculation(language);

  const locationsValid = pickupLocation && dropoffLocation;

  const handleCalculate = () => {
    calculateOrderCost(pickupLocation, dropoffLocation, onCostCalculated);
  };

  return (
    <div className="grid grid-cols-4 gap-4 mt-1 items-center justify-items-center text-center">
      <Button
        onClick={handleCalculate}
        type="button"
        disabled={!locationsValid || isCalculating}
        className={!locationsValid ? "opacity-70" : ""}
      >
        <Calculator className="mr-1" />
        {isCalculating
          ? language === "ar"
            ? "جاري الحساب..."
            : "Calculating..."
          : language === "ar"
          ? "احسب التكلفة"
          : "Calculate Cost"}
      </Button>
      
      <div className="bg-gray-50 rounded p-2">
        <p className="text-sm text-gray-500">
          {language === "ar" ? "المسافة" : "Distance"}
        </p>
        <p className="font-medium">{distance}</p>
      </div>
      
      <div className="bg-gray-50 rounded p-2">
        <p className="text-sm text-gray-500">
          {language === "ar" ? "الوقت المتوقع" : "Estimated Time"}
        </p>
        <p className="font-medium">{duration}</p>
      </div>
      
      <div className="bg-gray-50 rounded p-2">
        <p className="text-sm text-gray-500">
          {language === "ar" ? "المبلغ المتوقع" : "Estimated Cost"}
        </p>
        <p className="font-medium" dir={language === "ar" ? "rtl" : "ltr"}>
          {price}
        </p>
      </div>
    </div>
  );
};

export default CalculateOrderCost;
