interface PrivacyHeaderProps {
  language: string;
}

const PrivacyHeader = ({ language }: PrivacyHeaderProps) => {
  return (
    <div className="bg-[#0A192F] py-12 mb-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
          {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
        </h1>
      </div>
    </div>
  );
};

export default PrivacyHeader;
