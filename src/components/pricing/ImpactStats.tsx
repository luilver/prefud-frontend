
import { Leaf, Clock, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ImpactStats = () => {
  const { t } = useLanguage();

  const stats = [
    {
      icon: Leaf,
      titleKey: 'pricing.environmental-impact',
      descriptionKey: 'pricing.environmental-description',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
    },
    {
      icon: DollarSign,
      titleKey: 'pricing.money-savings',
      descriptionKey: 'pricing.money-description',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      icon: Clock,
      titleKey: 'pricing.time-efficiency',
      descriptionKey: 'pricing.time-description',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 sm:mb-16">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border/40">
            <div className={`p-2 rounded-lg ${stat.iconBg} shrink-0`}>
              <Icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-0.5">
                {t(stat.titleKey)}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(stat.descriptionKey)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ImpactStats;
