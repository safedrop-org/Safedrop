import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/customer/common/EmptyState";
import { Eye } from "lucide-react";

interface QuickActionItem {
  id: string;
  title: string;
  subtitle: string;
  status?: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive" | "secondary";
}

interface QuickActionsCardProps {
  title: string;
  items: QuickActionItem[];
  emptyState: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
  };
  headerAction?: React.ReactNode;
  className?: string;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  title,
  items,
  emptyState,
  headerAction,
  className = "",
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          {headerAction}
        </div>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={item.onClick}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.status && (
                    <Badge variant={item.variant || "secondary"}>
                      {item.status}
                    </Badge>
                  )}
                  <Eye className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState {...emptyState} />
        )}
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
