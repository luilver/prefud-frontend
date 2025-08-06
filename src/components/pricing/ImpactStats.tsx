
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Clock, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ImpactStats = () => {
  const { t } = useLanguage();

  const stats = [
    {
      icon: Leaf,
      titleKey: 'pricing.environmental-impact',
      descriptionKey: 'pricing.environmental-description',
      gradient: 'from-emerald-500/10 to-green-500/10',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200/20'
    },
    {
      icon: DollarSign,
      titleKey: 'pricing.money-savings',
      descriptionKey: 'pricing.money-description',
      gradient: 'from-blue-500/10 to-cyan-500/10',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200/20'
    },
    {
      icon: Clock,
      titleKey: 'pricing.time-efficiency',
      descriptionKey: 'pricing.time-description',
      gradient: 'from-orange-500/10 to-amber-500/10',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200/20'
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-24">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className={`bg-gradient-to-br ${stat.gradient} ${stat.borderColor} border hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group`}
          >
            <CardContent className="p-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="p-3 rounded-full bg-background/50 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <Icon className={`h-8 w-8 ${stat.iconColor}`} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {t(stat.titleKey)}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t(stat.descriptionKey)}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ImpactStats;
