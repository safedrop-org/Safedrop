
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VehicleInfo {
  make?: string;
  model?: string;
  year?: string;
  plateNumber?: string;
}

interface DriverInfoCardProps {
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  birth_date?: string;
  address?: string;
  national_id?: string;
  license_number?: string;
  vehicle_info?: VehicleInfo;
  status?: string;
  rejection_reason?: string;
}

export const DriverInfoCard = ({
  first_name,
  last_name,
  email,
  phone,
  birth_date,
  address,
  national_id,
  license_number,
  vehicle_info,
  status,
  rejection_reason,
}: DriverInfoCardProps) => {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="font-bold">الاسم الأول: </span>
              <span>{first_name || "غير متوفر"}</span>
            </div>
            
            <div>
              <span className="font-bold">اسم العائلة: </span>
              <span>{last_name || "غير متوفر"}</span>
            </div>
            
            <div>
              <span className="font-bold">البريد الإلكتروني: </span>
              <span>{email || "غير متوفر"}</span>
            </div>
            
            <div>
              <span className="font-bold">رقم الهاتف: </span>
              <span>{phone || "غير متوفر"}</span>
            </div>
            
            <div>
              <span className="font-bold">تاريخ الميلاد: </span>
              <span>{birth_date || "غير متوفر"}</span>
            </div>
            
            <div>
              <span className="font-bold">العنوان: </span>
              <span>{address || "غير متوفر"}</span>
            </div>
            
            <div>
              <span className="font-bold">الحالة: </span>
              <span className={
                status === "approved" ? "text-green-600" :
                status === "rejected" ? "text-red-600" :
                status === "pending" ? "text-yellow-600" :
                "text-gray-600"
              }>
                {status === "approved" ? "مقبول" :
                 status === "rejected" ? "مرفوض" :
                 status === "pending" ? "قيد المراجعة" :
                 "غير محدد"}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="font-bold">رقم الهوية: </span>
              <span>{national_id || "غير متوفر"}</span>
            </div>
            
            <div>
              <span className="font-bold">رقم الرخصة: </span>
              <span>{license_number || "غير متوفر"}</span>
            </div>
            
            <div>
              <span className="font-bold">نوع السيارة: </span>
              <span>{vehicle_info?.make || "غير متوفر"}</span>
            </div>
            
            <div>
              <span className="font-bold">موديل السيارة: </span>
              <span>{vehicle_info?.model || "غير متوفر"}</span>
            </div>
            
            <div>
              <span className="font-bold">سنة الصنع: </span>
              <span>{vehicle_info?.year || "غير متوفر"}</span>
            </div>
            
            <div>
              <span className="font-bold">رقم اللوحة: </span>
              <span>{vehicle_info?.plateNumber || "غير متوفر"}</span>
            </div>
          </div>
        </div>
        
        {status === "rejected" && rejection_reason && (
          <Alert className="mt-4 bg-red-50 border-red-200 text-right">
            <div className="font-bold mb-1">سبب الرفض:</div>
            <AlertDescription>{rejection_reason}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
