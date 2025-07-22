
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Star, Leaf, Clock, DollarSign, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import LanguageSelector from "@/components/LanguageSelector";

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

const Pricing = () => {
  const navigate = useNavigate();
  const { user, acceptSubscription } = useUser();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  const plans: PricingPlan[] = [
    {
      id: "free",
      nameKey: "pricing.plans.free.name",
      price: 0,
      interval: "month",
      descriptionKey: "pricing.plans.free.description",
      features: [
        `1 ${t('pricing.features.meal-plans')}`,
        t('pricing.features.basic-recipes'),
        t('pricing.features.shopping-list'),
        t('pricing.features.pantry-management'),
        t('pricing.features.email-support')
      ],
      limits: {
        plansPerMonth: 1,
        mealCreations: 3,
        deliveryCommissions: 0
      },
      savings: {
        environment: "Save 2kg CO2 monthly",
        money: "Save $50 on food waste",
        time: "Save 2 hours weekly"
      }
    },
    {
      id: "family",
      nameKey: "pricing.plans.family.name",
      price: 40,
      interval: "month",
      descriptionKey: "pricing.plans.family.description",
      popular: true,
      features: [
        `5 ${t('pricing.features.meal-plans')}`,
        `10 ${t('pricing.features.meal-creations')}`,
        t('pricing.features.ai-recommendations'),
        t('pricing.features.advanced-recipes'),
        `3 ${t('pricing.features.delivery-commissions')}`,
        t('pricing.features.nutritional-analysis'),
        t('pricing.features.priority-support')
      ],
      limits: {
        plansPerMonth: 5,
        mealCreations: 10,
        deliveryCommissions: 3
      },
      savings: {
        environment: "Save 15kg CO2 monthly",
        money: "Save $200 on groceries",
        time: "Save 8 hours weekly"
      }
    },
    {
      id: "professional",
      nameKey: "pricing.plans.professional.name",
      price: 120,
      interval: "month",
      descriptionKey: "pricing.plans.professional.description",
      features: [
        `12 ${t('pricing.features.meal-plans')}`,
        t('pricing.features.unlimited-creations'),
        `10 ${t('pricing.features.delivery-commissions')}`,
        `3 ${t('pricing.features.home-deliveries')}`,
        t('pricing.features.advanced-ai'),
        t('pricing.features.custom-dietary'),
        t('pricing.features.bulk-shopping'),
        t('pricing.features.professional-analytics'),
        t('pricing.features.phone-support'),
        t('pricing.features.priority-processing')
      ],
      limits: {
        plansPerMonth: 12,
        mealCreations: -1, // unlimited
        deliveryCommissions: 10,
        homeDeliveries: 3
      },
      savings: {
        environment: "Save 40kg CO2 monthly",
        money: "Save $500 on groceries",
        time: "Save 15 hours weekly"
      }
    }
  ];

  const handleSelectPlan = async (plan: PricingPlan) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to select a subscription plan.",
        variant: "destructive"
      });
      navigate('/signin');
      return;
    }

    if (plan.id === 'free') {
      toast({
        title: "Free Plan Active",
        description: "You're already on the free plan!",
      });
      return;
    }

    try {
      await acceptSubscription(plan.id);
      toast({
        title: "Plan Selected!",
        description: `Welcome to ${t(plan.nameKey)}! Your subscription is now active.`,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate subscription. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>{t('pricing.back-to-dashboard')}</span>
          </Button>
          <LanguageSelector variant="button" />
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Impact Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center bg-green-100 border-green-300">
            <CardContent className="p-6">
              <Leaf className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">{t('pricing.environmental-impact')}</h3>
              <p className="text-green-700">{t('pricing.environmental-description')}</p>
            </CardContent>
          </Card>
          <Card className="text-center bg-blue-100 border-blue-300">
            <CardContent className="p-6">
              <DollarSign className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">{t('pricing.money-savings')}</h3>
              <p className="text-blue-700">{t('pricing.money-description')}</p>
            </CardContent>
          </Card>
          <Card className="text-center bg-orange-100 border-orange-300">
            <CardContent className="p-6">
              <Clock className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-orange-800 mb-2">{t('pricing.time-efficiency')}</h3>
              <p className="text-orange-700">{t('pricing.time-description')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative ${
                plan.popular 
                  ? 'border-green-500 border-2 bg-gradient-to-b from-green-50 to-white shadow-lg' 
                  : 'border-gray-200 hover:shadow-md transition-shadow'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>{t('pricing.most-popular')}</span>
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <Crown className={`h-8 w-8 ${plan.popular ? 'text-green-500' : 'text-gray-400'}`} />
                </div>
                <CardTitle className="text-2xl">{t(plan.nameKey)}</CardTitle>
                <CardDescription className="text-sm mb-4">{t(plan.descriptionKey)}</CardDescription>
                <div className="text-4xl font-bold text-gray-800">
                  {plan.price === 0 ? t('pricing.plans.free.name') : `$${plan.price}`}
                  {plan.price > 0 && <span className="text-sm font-normal text-gray-600">/{plan.interval}</span>}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">{t('pricing.features-title')}</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Savings */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">{t('pricing.impact-title')}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Leaf className="h-4 w-4 text-green-500" />
                      <span className="text-green-700">{plan.savings.environment}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-700">{plan.savings.money}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-orange-700">{plan.savings.time}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600'
                      : plan.price === 0 
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {plan.price === 0 ? t('pricing.current-plan') : `${t('pricing.choose-plan')} ${t(plan.nameKey)}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {t('pricing.faq.title')}
          </h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  {t('pricing.faq.environment.question')}
                </h3>
                <p className="text-gray-600">
                  {t('pricing.faq.environment.answer')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  {t('pricing.faq.change-plans.question')}
                </h3>
                <p className="text-gray-600">
                  {t('pricing.faq.change-plans.answer')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  {t('pricing.faq.limits.question')}
                </h3>
                <p className="text-gray-600">
                  {t('pricing.faq.limits.answer')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
