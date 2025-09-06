import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Crown, Sparkles, ArrowRight, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SubscriptionUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureType?: "drinks" | "meals" | "plans";
}

const SubscriptionUpgradeModal = ({ 
  isOpen, 
  onClose, 
  featureType = "drinks" 
}: SubscriptionUpgradeModalProps) => {
  const { t } = useLanguage();

  const featureMessages = {
    drinks: {
      title: "Upgrade to Generate More Healthy Drinks",
      subtitle: "You've reached your limit for healthy drink generation",
      feature: "unlimited healthy drinks",
      icon: "🥤"
    },
    meals: {
      title: "Upgrade to Generate More Meals",
      subtitle: "You've reached your limit for meal generation", 
      feature: "unlimited meal plans",
      icon: "🍽️"
    },
    plans: {
      title: "Upgrade to Create More Plans",
      subtitle: "You've reached your limit for plan creation",
      feature: "unlimited planning",
      icon: "📋"
    }
  };

  const currentFeature = featureMessages[featureType];

  const handleUpgrade = () => {
    // Navigate to pricing/subscription page
    window.location.href = '/pricing';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-background via-background to-primary/5 border-primary/20">
        <DialogHeader className="text-center space-y-4 pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center text-2xl shadow-glow">
            {currentFeature.icon}
          </div>
          <div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              {currentFeature.title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {currentFeature.subtitle}
            </p>
          </div>
        </DialogHeader>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Premium Plan
              </CardTitle>
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                Popular
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
                <span>Unlimited healthy drink generation</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
                <span>Unlimited meal planning</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
                <span>Advanced nutritional insights</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
                <span>Priority customer support</span>
              </div>
            </div>

            <div className="pt-4 border-t border-primary/10">
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-primary">$9.99</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
              
              <Button 
                onClick={handleUpgrade}
                className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-elegant transition-all duration-300 group"
                size="lg"
              >
                <Zap className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Upgrade Now
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Maybe later
          </Button>
        </div>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionUpgradeModal;