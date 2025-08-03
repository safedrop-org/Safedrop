import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/components/ui/language-context';

interface AdminLoadingStateProps {
  message?: string;
}

export const AdminLoadingState: React.FC<AdminLoadingStateProps> = ({
  message,
}) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardContent className="p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-500">{message || t("loadingComplaints")}</p>
        </div>
      </CardContent>
    </Card>
  );
};

interface AdminErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const AdminErrorState: React.FC<AdminErrorStateProps> = ({
  title,
  message,
  onRetry,
}) => {
  const { t } = useLanguage();

  return (
    <div className="p-4 sm:p-6">
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="text-red-500">
              <AlertTriangle className="h-12 w-12 mx-auto" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                {title || t("errorLoadingData")}
              </h3>
              <p className="text-red-600 mb-4">
                {message || t("errorLoadingComplaints")}
              </p>
              {onRetry && (
                <Button
                  onClick={onRetry}
                  variant="outline"
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  {t("retryLoading")}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
