
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { t } = useLanguage();

  const plans = [
    {
      name: t('pricing.free.name'),
      price: t('pricing.free.price'),
      period: t('pricing.free.period'),
      description: t('pricing.free.description'),
      features: [
        t('pricing.free.features.plans'),
        t('pricing.free.features.recipes'),
        t('pricing.free.features.shopping'),
        t('pricing.free.features.tracking'),
      ],
      popular: false,
    },
    {
      name: t('pricing.pro.name'),
      price: t('pricing.pro.price'),
      period: t('pricing.pro.period'),
      description: t('pricing.pro.description'),
      features: [
        t('pricing.pro.features.plans'),
        t('pricing.pro.features.recipes'),
        t('pricing.pro.features.shopping'),
        t('pricing.pro.features.tracking'),
        t('pricing.pro.features.nutrition'),
        t('pricing.pro.features.waste'),
      ],
      popular: true,
    },
    {
      name: t('pricing.premium.name'),
      price: t('pricing.premium.price'),
      period: t('pricing.premium.period'),
      description: t('pricing.premium.description'),
      features: [
        t('pricing.premium.features.everything'),
        t('pricing.premium.features.family'),
        t('pricing.premium.features.bulk'),
        t('pricing.premium.features.integration'),
        t('pricing.premium.features.support'),
        t('pricing.premium.features.export'),
      ],
      popular: false,
    },
  ];

  const faqs = [
    {
      question: t('pricing.faq.trial.question'),
      answer: t('pricing.faq.trial.answer'),
    },
    {
      question: t('pricing.faq.cancel.question'),
      answer: t('pricing.faq.cancel.answer'),
    },
    {
      question: t('pricing.faq.data.question'),
      answer: t('pricing.faq.data.answer'),
    },
    {
      question: t('pricing.faq.payment.question'),
      answer: t('pricing.faq.payment.answer'),
    },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('pricing.subtitle')}
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${!isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              {t('pricing.monthly')}
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              {t('pricing.annually')}
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="ml-2">
                {t('pricing.save')}
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-green-500 shadow-lg' : 'border-gray-200'}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600">
                  {t('pricing.popular')}
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  asChild 
                  className={`w-full mt-6 ${plan.popular ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  <Link to="/signup">{t('pricing.cta')}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">{t('pricing.faq.title')}</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
