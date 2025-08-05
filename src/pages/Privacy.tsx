import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import PrivacyHeader from "@/components/privacy/PrivacyHeader";
import PrivacyContentArabic from "@/components/privacy/PrivacyContentArabic";
import PrivacyContentEnglish from "@/components/privacy/PrivacyContentEnglish";

const PrivacyContent = () => {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <PrivacyHeader language={language} />
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            {language === "ar" ? (
              <PrivacyContentArabic />
            ) : (
              <PrivacyContentEnglish />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Privacy = () => {
  return (
    <LanguageProvider>
      <PrivacyContent />
    </LanguageProvider>
  );
};

export default Privacy;
