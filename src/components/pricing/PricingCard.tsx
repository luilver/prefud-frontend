
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card 
      className={`relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 group ${
        plan.popular 
          ? 'border-primary/20 bg-gradient-to-b from-primary/5 via-background to-background ring-1 ring-primary/10' 
          : 'border-border/50 hover:border-primary/20 bg-background/50 backdrop-blur-sm'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {plan.popular && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary"></div>
      )}

      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium flex items-center space-x-1.5 shadow-lg border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t('pricing.most-popular')}</span>
          </div>
        </div>
      )}
      
      <CardHeader className="text-center pb-8 pt-8">
        <CardTitle className="text-2xl font-bold text-foreground mb-2">{t(plan.nameKey)}</CardTitle>
        <p className="text-muted-foreground text-sm mb-8">
          {t(plan.descriptionKey)}
        </p>
        
        <div className="mb-6">
          <div className="flex items-baseline justify-center">
            {plan.price === 0 ? (
              <span className="text-4xl font-bold text-primary">{t('pricing.plans.free.name')}</span>
            ) : (
              <>
                <span className="text-sm font-medium text-muted-foreground">$</span>
                <span className="text-5xl font-bold text-foreground tracking-tight">{plan.price}</span>
                <span className="text-muted-foreground ml-1">/{plan.interval}</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        <div className="space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3 group/feature">
              <div className="flex-shrink-0 mt-0.5">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground leading-relaxed group-hover/feature:text-foreground transition-colors">
                {feature}
              </span>
            </div>
          ))}
        </div>

        <Button
          onClick={() => onSelectPlan(plan)}
          size="lg"
          className={`w-full h-12 text-sm font-medium transition-all duration-300 group ${
            plan.popular
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/25'
              : plan.price === 0 
              ? 'bg-muted hover:bg-muted/80 text-muted-foreground'
              : 'bg-foreground hover:bg-foreground/90 text-background'
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
      </CardContent>
    </Card>
  );
};

export default PricingCard;
