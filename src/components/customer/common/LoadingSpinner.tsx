import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "md", 
  className = "" 
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className="flex justify-center items-center h-64">
      <div 
        className={`animate-spin rounded-full border-b-2 border-safedrop-primary ${sizeClasses[size]} ${className}`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
