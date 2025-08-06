
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const PricingFAQ = () => {
  const { t } = useLanguage();

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
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">
        {t('pricing.faq.title')}
      </h2>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-8">
              <h3 className="font-bold text-gray-800 mb-4 text-xl">
                {t(faq.questionKey)}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {t(faq.answerKey)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PricingFAQ;
