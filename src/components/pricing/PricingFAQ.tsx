
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

const PricingFAQ = () => {
  const { t } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const faqs = [
    {
      questionKey: 'pricing.faq.environment.question',
      answerKey: 'pricing.faq.environment.answer'
    },
    {
      questionKey: 'pricing.faq.change-plans.question',
      answerKey: 'pricing.faq.change-plans.answer'
    },
    {
      questionKey: 'pricing.faq.limits.question',
      answerKey: 'pricing.faq.limits.answer'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          {t('pricing.faq.title')}
        </h2>
        <p className="text-muted-foreground">
          Everything you need to know about our pricing plans
        </p>
      </div>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card 
            key={index} 
            className="border-border/50 hover:border-primary/20 transition-all duration-300 overflow-hidden"
          >
            <CardContent className="p-0">
              <button
                className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <h3 className="font-semibold text-foreground pr-4">
                  {t(faq.questionKey)}
                </h3>
                <ChevronRight 
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
                    expandedIndex === index ? 'rotate-90' : ''
                  }`} 
                />
              </button>
              {expandedIndex === index && (
                <div className="px-6 pb-6 animate-fade-in">
                  <p className="text-muted-foreground leading-relaxed">
                    {t(faq.answerKey)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PricingFAQ;
