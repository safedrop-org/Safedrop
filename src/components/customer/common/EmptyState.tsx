import React from "react";
import { Bell } from "lucide-react";
import { useLanguage } from "@/components/ui/language-context";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  const defaultIcon = <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />;

  return (
    <div className="text-center py-12">
      {icon || defaultIcon}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 mb-4">
        {description}
      </p>
      {action}
    </div>
  );
};

export default EmptyState;
