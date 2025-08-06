
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Star, Leaf, DollarSign, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PricingPlan {
  id: string;
  nameKey: string;
  price: number;
  interval: string;
  descriptionKey: string;
  features: string[];
  limits: {
    plansPerMonth: number;
    mealCreations: number;
    deliveryCommissions: number;
    homeDeliveries?: number;
  };
  popular?: boolean;
  savings: {
    environment: string;
    money: string;
    time: string;
  };
}

interface PricingCardProps {
  plan: PricingPlan;
  onSelectPlan: (plan: PricingPlan) => void;
}

const PricingCard = ({ plan, onSelectPlan }: PricingCardProps) => {
  const { t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className={`relative transition-all duration-300 ${
        plan.popular 
          ? 'border-green-500 border-2 bg-gradient-to-b from-green-50 via-white to-green-50 shadow-xl scale-105' 
          : 'border-gray-200 hover:shadow-lg hover:scale-102'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-green-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center space-x-2 shadow-lg">
            <Star className="h-4 w-4" />
            <span>{t('pricing.most-popular')}</span>
          </div>
        </div>
      )}
      
      <CardHeader className="text-center pb-6 pt-8">
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full ${
            plan.popular 
              ? 'bg-gradient-to-br from-green-100 to-orange-100' 
              : 'bg-gray-100'
          }`}>
            <Crown className={`h-10 w-10 ${
              plan.popular ? 'text-green-600' : 'text-gray-400'
            }`} />
          </div>
        </div>
        
        <CardTitle className="text-3xl font-bold mb-2">{t(plan.nameKey)}</CardTitle>
        <CardDescription className="text-base mb-6 text-gray-600">
          {t(plan.descriptionKey)}
        </CardDescription>
        
        <div className="mb-6">
          <div className="text-5xl font-bold text-gray-800 mb-2">
            {plan.price === 0 ? (
              <span className="text-green-600">{t('pricing.plans.free.name')}</span>
            ) : (
              <>
                <span className="text-4xl">$</span>{plan.price}
                <span className="text-lg font-normal text-gray-600 ml-1">
                  /{plan.interval}
                </span>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 px-8 pb-8">
        {/* Features */}
        <div>
          <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            {t('pricing.features-title')}
          </h4>
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Impact Savings */}
        <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${
          isHovered ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100'
        }`}>
          <h4 className="font-bold text-gray-800 mb-4 text-lg">
            {t('pricing.impact-title')}
          </h4>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50">
              <Leaf className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-green-800 font-medium">{plan.savings.environment}</span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50">
              <DollarSign className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <span className="text-blue-800 font-medium">{plan.savings.money}</span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-orange-50">
              <Clock className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <span className="text-orange-800 font-medium">{plan.savings.time}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => onSelectPlan(plan)}
          size="lg"
          className={`w-full h-14 text-lg font-bold transition-all duration-300 ${
            plan.popular
              ? 'bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
              : plan.price === 0 
              ? 'bg-gray-600 hover:bg-gray-700'
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          {plan.price === 0 
            ? t('pricing.current-plan') 
            : `${t('pricing.choose-plan')} ${t(plan.nameKey)}`
          }
        </Button>
      </CardContent>
    </Card>
  );
};

export default PricingCard;
