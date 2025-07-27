import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LucideIcon } from "lucide-react";

interface AuthInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: LucideIcon;
  className?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  className = "",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {Icon && (
          <Icon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 rtl:left-auto rtl:right-3" />
        )}
        <Input
          id={id}
          type={type}
          className={`${Icon ? "pl-10 rtl:pl-4 rtl:pr-10" : ""}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  description,
  children,
  className = "",
}) => {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <main className="flex-grow py-16 bg-gray-50">
        <div className="max-w-md mx-auto px-4">
          <div className="shadow-lg rounded-lg bg-white">
            <div className="text-center pb-2 pt-6 px-6">
              <img
                alt="SafeDrop Logo"
                className="mx-auto h-20 w-auto mb-2"
                src="/lovable-uploads/abbaa84d-9220-43c2-833e-afb017f5a986.png"
              />
              <h1 className="text-2xl font-bold text-safedrop-primary mb-2">
                {title}
              </h1>
              <p className="text-gray-600 text-sm">
                {description}
              </p>
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

interface LoadingButtonProps {
  isLoading: boolean;
  loadingText: string;
  normalText: string;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText,
  normalText,
  className = "",
  type = "submit",
  disabled = false,
  onClick,
}) => {
  return (
    <button
      type={type}
      className={`w-full bg-safedrop-gold hover:bg-safedrop-gold/90 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${className}`}
      disabled={isLoading || disabled}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          {loadingText}
        </>
      ) : (
        normalText
      )}
    </button>
  );
};
