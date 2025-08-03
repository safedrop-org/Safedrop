import { useLanguage } from "@/components/ui/language-context";
import { Card } from "@/components/ui/card";
import { Phone, Mail } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  DriverPageLayout, 
  DriverContactCard,
  SUPPORT_CONTACTS,
  EMAIL_TEMPLATES
} from "@/components/driver/common";
import { FAQ_KEYS } from "@/constants/faq";

const DriverSupportContent = () => {
  const { t } = useLanguage();

  const handleCall = () => {
    window.location.href = `tel:${SUPPORT_CONTACTS.PHONE.RAW}`;
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(EMAIL_TEMPLATES.SUPPORT_REQUEST.SUBJECT);
    const body = encodeURIComponent(EMAIL_TEMPLATES.SUPPORT_REQUEST.BODY);
    window.location.href = `mailto:${SUPPORT_CONTACTS.EMAIL}?subject=${subject}&body=${body}`;
  };

  const getFormattedPhoneNumber = () => {
    return SUPPORT_CONTACTS.PHONE.FORMATTED;
  };

  const faqItems = FAQ_KEYS.map((faq) => ({
    question: t(faq.questionKey),
    answer: t(faq.answerKey),
  }));

  return (
    <DriverPageLayout title={t("supportTitle")}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DriverContactCard
          title={t("callUs")}
          description={getFormattedPhoneNumber()}
          icon={Phone}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          actionText={t("callUs")}
          onAction={handleCall}
        />

        <DriverContactCard
          title={t("emailSupport")}
          description={t("contactEmail")}
          icon={Mail}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          actionText={t("emailSupport")}
          onAction={handleEmail}
        />
      </div>

      <Card className="p-6">
        <h2 className="md:text-2xl font-bold mb-4 text-xl">
          {t("faqTitle")}
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                <p
                  className="text-gray-600"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {item.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </DriverPageLayout>
  );
};

const DriverSupport = () => {
  return <DriverSupportContent />;
};

export default DriverSupport;