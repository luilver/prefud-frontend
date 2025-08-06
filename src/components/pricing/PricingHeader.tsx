
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

const PricingHeader = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <>
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>{t('pricing.back-to-dashboard')}</span>
        </Button>
        <LanguageSelector variant="button" />
      </div>

      {/* Title Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
          {t('pricing.title')}
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
          {t('pricing.subtitle')}
        </p>
      </div>
    </>
  );
};

export default PricingHeader;
