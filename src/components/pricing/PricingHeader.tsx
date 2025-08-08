
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

const PricingHeader = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-12">
        <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          <span>{t('pricing.back-to-dashboard')}</span>
        </Button>
        <LanguageSelector variant="button" />
      </div>

      {/* Title Section */}
      <div className="text-center mb-20">
        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          Pricing Plans
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight tracking-tight">
          {t('pricing.title')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t('pricing.subtitle')}
        </p>
      </div>
    </div>
  );
};

export default PricingHeader;
