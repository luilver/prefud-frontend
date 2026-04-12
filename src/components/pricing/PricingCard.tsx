
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles } from "lucide-react";
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
    <div 
      className={`relative flex flex-col rounded-2xl transition-all duration-300 hover:shadow-xl ${
        plan.popular 
          ? 'bg-gradient-to-b from-emerald-900 to-emerald-950 text-white ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10 scale-[1.02] sm:scale-105' 
          : 'bg-card border border-border/60 hover:border-primary/30'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md">
            <Sparkles className="h-3 w-3" />
            {t('pricing.most-popular')}
          </div>
        </div>
      )}

      <div className="p-5 sm:p-6 pb-0 text-center">
        <h3 className={`text-lg font-semibold mb-1 ${plan.popular ? 'text-white' : 'text-foreground'}`}>
          {t(plan.nameKey)}
        </h3>
        <p className={`text-xs mb-4 ${plan.popular ? 'text-emerald-200/70' : 'text-muted-foreground'}`}>
          {t(plan.descriptionKey)}
        </p>

        <div className="mb-4">
          {plan.price === 0 ? (
            <span className={`text-3xl sm:text-4xl font-bold ${plan.popular ? 'text-emerald-300' : 'text-primary'}`}>
              {t('pricing.plans.free.name')}
            </span>
          ) : (
            <div className="flex items-baseline justify-center gap-0.5">
              <span className={`text-sm ${plan.popular ? 'text-emerald-300/70' : 'text-muted-foreground'}`}>$</span>
              <span className={`text-3xl sm:text-4xl font-bold tracking-tight ${plan.popular ? 'text-white' : 'text-foreground'}`}>
                {plan.price}
              </span>
              <span className={`text-sm ml-1 ${plan.popular ? 'text-emerald-300/70' : 'text-muted-foreground'}`}>
                /{plan.interval}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={`mx-5 sm:mx-6 border-t ${plan.popular ? 'border-emerald-700/50' : 'border-border/50'}`} />

      <div className="flex-1 p-5 sm:p-6 pt-4">
        <ul className="space-y-2.5 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <Check className={`h-4 w-4 mt-0.5 shrink-0 ${plan.popular ? 'text-emerald-400' : 'text-primary'}`} />
              <span className={`text-sm leading-snug ${plan.popular ? 'text-emerald-100/90' : 'text-muted-foreground'}`}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-5 sm:p-6 pt-0">
        <Button
          onClick={() => onSelectPlan(plan)}
          className={`w-full h-11 text-sm font-medium rounded-xl transition-all duration-300 ${
            plan.popular
              ? 'bg-white text-emerald-900 hover:bg-emerald-50 shadow-md'
              : plan.price === 0 
              ? 'bg-muted hover:bg-muted/80 text-muted-foreground'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
        >
          <span>
            {plan.price === 0 
              ? t('pricing.current-plan') 
              : `${t('pricing.choose-plan')} ${t(plan.nameKey)}`
            }
          </span>
          <ArrowRight className={`h-4 w-4 ml-2 transition-transform duration-300 ${
            isHovered ? 'translate-x-1' : ''
          }`} />
        </Button>
      </div>
    </div>
  );
};

export default PricingCard;
