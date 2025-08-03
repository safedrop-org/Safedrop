import React from "react";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import { Button } from "@/components/ui/button";

interface LoadingStateProps {
  isLoading?: boolean;
}

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

interface EmptyStateProps {
  message: string;
}

export const LoadingState: React.FC<LoadingStateProps> = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <div className="flex-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary"></div>
      </div>
    </div>
  );
};

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <div className="flex-1 flex justify-center items-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error loading orders: {error.message}
          </p>
          <Button onClick={onRetry || (() => window.location.reload())}>
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <div className="text-center py-10 text-gray-500">
      <p>{message}</p>
    </div>
  );
};
