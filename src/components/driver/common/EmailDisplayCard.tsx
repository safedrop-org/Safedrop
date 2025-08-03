import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Mail } from 'lucide-react';

interface EmailDisplayCardProps {
  userEmail: string;
  t: (key: string) => string;
}

const EmailDisplayCard: React.FC<EmailDisplayCardProps> = ({ userEmail, t }) => {
  return (
    <Card className="bg-white rounded-lg shadow-md max-w-2xl mb-6">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          {t('emailForRecovery')}
        </CardTitle>
        <CardDescription>
          {t('emailForRecoveryDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Alert className="mb-4">
          <AlertTitle className="font-semibold">{t('importantNote')}</AlertTitle>
          <AlertDescription>
            {t('useThisEmailForRecovery')}
          </AlertDescription>
        </Alert>
        <div className="border p-4 rounded-md bg-gray-50">
          <Label htmlFor="email">{t('email')}</Label>
          <div className="flex items-center mt-2">
            <Input
              id="email"
              name="email"
              value={userEmail}
              readOnly
              className="bg-white"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailDisplayCard;
