import React from "react";
import CustomerPageLayout from "@/components/customer/CustomerPageLayout";
import ContactCards from "@/components/customer/common/ContactCards";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Phone, Mail } from "lucide-react";
import { useLanguage } from "@/components/ui/language-context";
const CustomerSupportContent = () => {
  const { t } = useLanguage();
  
  const handleCall = () => {
    const phoneNumber = "+966556160601";
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleEmail = () => {
    const email = "support@safedropksa.com";
    const subject = encodeURIComponent("طلب دعم فني - Support Request");
    const body = encodeURIComponent("");
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const contactMethods = [
    {
      type: 'phone' as const,
      icon: <Phone className="w-6 h-6" />,
      title: t("callUs"),
      value: "+966 55 616 0601",
      action: handleCall,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      type: 'email' as const,
      icon: <Mail className="w-6 h-6" />,
      title: t("emailSupport"),
      action: handleEmail,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <CustomerPageLayout title={t("support")}>
      <ContactCards methods={contactMethods} className="mb-8" />

      <Card className="p-6">
        <h2 className="md:text-2xl font-bold mb-4 text-xl">
          {t("faqTitle")}
        </h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>{t("trackOrder")}</AccordionTrigger>
            <AccordionContent>{t("trackOrderAnswer")}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>{t("needHelpOrder")}</AccordionTrigger>
            <AccordionContent>{t("needHelpOrderAnswer")}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>{t("contactDriver")}</AccordionTrigger>
            <AccordionContent>{t("contactDriverAnswer")}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>{t("modifyAddress")}</AccordionTrigger>
            <AccordionContent>{t("modifyAddressAnswer")}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>{t("deleteAccountQuestion")}</AccordionTrigger>
            <AccordionContent style={{ whiteSpace: "pre-line" }}>
              {t("deleteAccountAnswer")}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </CustomerPageLayout>
  );
};
const CustomerSupport = () => {
  return <CustomerSupportContent />;
};

export default CustomerSupport;
