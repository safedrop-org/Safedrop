import React from "react";
import { useLanguage } from "@/components/ui/language-context";

interface SimplePageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const SimplePageLayout: React.FC<SimplePageLayoutProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`flex h-screen bg-gray-50 ${className}`}>
      {children}
    </div>
  );
};

export default SimplePageLayout;
