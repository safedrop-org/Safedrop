import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFormatPhone } from "@/hooks/useFormatters";
import { useLanguage } from "@/components/ui/language-context";

interface ContactMethod {
  type: 'phone' | 'email';
  icon: React.ReactNode;
  title: string;
  value?: string;
  action: () => void;
  bgColor: string;
  iconColor: string;
}

interface ContactCardsProps {
  methods: ContactMethod[];
  className?: string;
}

const ContactCards: React.FC<ContactCardsProps> = ({ methods, className = "" }) => {
  const { getFormattedPhoneNumber } = useFormatPhone();
  const { t } = useLanguage();

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {methods.map((method, index) => (
        <Card key={index} className="flex flex-col items-center justify-center p-6">
          <div className={`${method.bgColor} p-3 rounded-full mb-4`}>
            <div className={method.iconColor}>
              {method.icon}
            </div>
          </div>
          <h2 className="text-lg font-semibold mb-2">{method.title}</h2>
          <p className="text-sm text-gray-500 mb-4">
            {method.type === 'phone' 
              ? getFormattedPhoneNumber(method.value)
              : method.value || t("contactEmail")
            }
          </p>
          <Button variant="outline" onClick={method.action} className="w-full">
            {method.title}
          </Button>
        </Card>
      ))}
    </div>
  );
};

export default ContactCards;
