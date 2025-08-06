
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
      colorClasses: {
        bg: 'bg-gradient-to-br from-green-50 to-green-100',
        border: 'border-green-200',
        icon: 'text-green-600',
        title: 'text-green-800',
        description: 'text-green-700'
      }
    },
    {
      icon: DollarSign,
      titleKey: 'pricing.money-savings',
      descriptionKey: 'pricing.money-description',
      colorClasses: {
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        title: 'text-blue-800',
        description: 'text-blue-700'
      }
    },
    {
      icon: Clock,
      titleKey: 'pricing.time-efficiency',
      descriptionKey: 'pricing.time-description',
      colorClasses: {
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
        border: 'border-orange-200',
        icon: 'text-orange-600',
        title: 'text-orange-800',
        description: 'text-orange-700'
      }
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8 mb-20">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className={`${stat.colorClasses.bg} ${stat.colorClasses.border} border-2 hover:shadow-lg transition-all duration-300 hover:scale-105`}
          >
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Icon className={`h-16 w-16 ${stat.colorClasses.icon} mx-auto`} />
              </div>
              <h3 className={`text-xl font-bold ${stat.colorClasses.title} mb-4`}>
                {t(stat.titleKey)}
              </h3>
              <p className={`${stat.colorClasses.description} text-base leading-relaxed`}>
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
