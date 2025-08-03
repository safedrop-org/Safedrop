import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { toast } from "sonner";

interface LocationType {
  address: string;
  details?: string;
}

interface OrderFormData {
  pickupLocation: LocationType;
  dropoffLocation: LocationType;
  packageDetails: string;
  notes: string;
}

export const useCreateOrder = (language: string) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<OrderFormData>({
    pickupLocation: {
      address: "",
      details: "",
    },
    dropoffLocation: {
      address: "",
      details: "",
    },
    packageDetails: "",
    notes: "",
  });

  const handleLocationChange = (
    type: "pickupLocation" | "dropoffLocation",
    field: "address" | "details",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(
        language === "ar" ? "يرجى تسجيل الدخول أولاً" : "Please login first"
      );
      return;
    }

    if (
      !formData.pickupLocation.address ||
      !formData.dropoffLocation.address ||
      !formData.packageDetails
    ) {
      toast.error(
        language === "ar"
          ? "يرجى ملء جميع الحقول الإلزامية"
          : "Please fill in all required fields"
      );
      return;
    }

    if (!estimatedCost) {
      toast.error(
        language === "ar"
          ? "يرجى حساب التكلفة أولاً"
          : "Please calculate the cost first"
      );
      return;
    }

    try {
      setSubmitting(true);

      const { data: orderData, error } = await supabase
        .from("orders")
        .insert([
          {
            customer_id: user.id,
            pickup_location: {
              address: formData.pickupLocation.address,
              details: formData.pickupLocation.details || "",
            },
            dropoff_location: {
              address: formData.dropoffLocation.address,
              details: formData.dropoffLocation.details || "",
            },
            package_details: formData.packageDetails,
            notes: formData.notes,
            status: "available",
            payment_status: "pending",
            commission_rate: 0.2,
            price: estimatedCost, // Save the calculated cost
          },
        ])
        .select();

      if (error) {
        console.error("Error creating order:", error);
        throw error;
      }

      toast.success(
        language === "ar"
          ? "تم إنشاء الطلب بنجاح"
          : "Order created successfully"
      );
      navigate("/customer/orders");
    } catch (error: unknown) {
      console.error("Error creating order:", error);
      toast.error(
        (language === "ar"
          ? "حدث خطأ أثناء إنشاء الطلب: "
          : "Error creating order: ") + 
        (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formData,
    submitting,
    estimatedCost,
    setEstimatedCost,
    handleLocationChange,
    handleTextChange,
    submitOrder,
  };
};
