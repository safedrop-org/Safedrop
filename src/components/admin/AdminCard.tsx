import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

/**
 * AdminCard - مكون بطاقة مشترك لصفحات الإدارة
 * يوفر تصميم موحد للبطاقات مع عنوان وأيقونة اختيارية
 */
const AdminCard: React.FC<AdminCardProps> = ({ 
  title, 
  icon, 
  children, 
  className = "", 
  headerActions 
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
          {headerActions}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default AdminCard;
