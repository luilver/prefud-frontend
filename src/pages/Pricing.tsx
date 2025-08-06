import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import PricingHeader from "@/components/pricing/PricingHeader";
import ImpactStats from "@/components/pricing/ImpactStats";
import PricingCard from "@/components/pricing/PricingCard";
import PricingFAQ from "@/components/pricing/PricingFAQ";

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <PricingHeader />
        <ImpactStats />
        
        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <PricingCard 
              key={plan.id}
              plan={plan}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>

        <PricingFAQ />
      </div>
    </div>
  );
};

export default Pricing;
