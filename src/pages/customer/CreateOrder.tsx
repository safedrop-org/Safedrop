import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Truck } from "lucide-react";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import {
  CalculateOrderCost,
  LocationForm,
  PackageDetailsForm,
} from "@/components/customer/common";

const CreateOrderContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  
  const {
    formData,
    submitting,
    estimatedCost,
    setEstimatedCost,
    handleLocationChange,
    handleTextChange,
    submitOrder,
  } = useCreateOrder(language);

  useEffect(() => {
    if (!user) {
      toast.error(
        language === "ar" ? "يرجى تسجيل الدخول أولاً" : "Please login first"
      );
      navigate("/login");
    }
  }, [user, navigate, language]);

  const handlePickupLocationChange = (field: "address" | "details", value: string) => {
    handleLocationChange("pickupLocation", field, value);
    // Reset estimated cost when location changes
    if (field === "address") {
      setEstimatedCost(null);
    }
  };

  const handleDropoffLocationChange = (field: "address" | "details", value: string) => {
    handleLocationChange("dropoffLocation", field, value);
    // Reset estimated cost when location changes
    if (field === "address") {
      setEstimatedCost(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">
          {t("createOrder")}
        </h1>

        <form onSubmit={submitOrder} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LocationForm
              type="pickup"
              location={formData.pickupLocation}
              onChange={handlePickupLocationChange}
            />
            
            <LocationForm
              type="delivery"
              location={formData.dropoffLocation}
              onChange={handleDropoffLocationChange}
            />
          </div>

          <CalculateOrderCost
            pickupLocation={formData.pickupLocation.address}
            dropoffLocation={formData.dropoffLocation.address}
            onCostCalculated={setEstimatedCost}
          />

          {!estimatedCost && formData.pickupLocation.address && formData.dropoffLocation.address && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800 text-sm">
                {t("calculateCostRequired") || (language === "ar" 
                  ? "يرجى حساب التكلفة قبل المتابعة" 
                  : "Please calculate the cost before proceeding"
                )}
              </p>
            </div>
          )}

          <PackageDetailsForm
            packageDetails={formData.packageDetails}
            notes={formData.notes}
            estimatedCost={estimatedCost}
            onChange={handleTextChange}
          />

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/customer/dashboard")}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              className="bg-safedrop-gold hover:bg-safedrop-gold/90 gap-2"
              disabled={submitting || !estimatedCost}
            >
              {submitting ? (
                t("sending")
              ) : (
                <>
                  <Truck className="h-4 w-4" />
                  {estimatedCost 
                    ? `${t("submitOrder")} (${estimatedCost} ${language === "ar" ? "ريال" : "SAR"})`
                    : t("submitOrder")
                  }
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

const CreateOrder = () => {
  return (
    <LanguageProvider>
      <CreateOrderContent />
    </LanguageProvider>
  );
};

export default CreateOrder;
