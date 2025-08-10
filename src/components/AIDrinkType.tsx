import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface AIDrinkTypeProps {
  data: any;
  onUpdate: (key: string, value: any) => void;
  onNext: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

const AIDrinkType = ({ data, onUpdate, onNext }: AIDrinkTypeProps) => {
  const { t } = useLanguage();

  const drinkTypes = [
    {
      id: 'smoothie',
      title: `🥤 ${t("aiDrinkType.smoothie.title") || "Smoothie"}`,
      description: t("aiDrinkType.smoothie.desc") || "Thick, creamy blended drinks with fruits and vegetables",
      benefits: [
        t("aiDrinkType.smoothie.benefit1") || "High in fiber",
        t("aiDrinkType.smoothie.benefit2") || "Filling",
        t("aiDrinkType.smoothie.benefit3") || "Easy to digest"
      ]
    },
    {
      id: 'juice',
      title: `🧃 ${t("aiDrinkType.juice.title") || "Fresh Juice"}`,
      description: t("aiDrinkType.juice.desc") || "Pure liquid extracted from fruits and vegetables",
      benefits: [
        t("aiDrinkType.juice.benefit1") || "Quick absorption",
        t("aiDrinkType.juice.benefit2") || "Vitamin-rich",
        t("aiDrinkType.juice.benefit3") || "Hydrating"
      ]
    },
    {
      id: 'tea',
      title: `🍵 ${t("aiDrinkType.tea.title") || "Wellness Tea"}`,
      description: t("aiDrinkType.tea.desc") || "Herbal and functional teas for health benefits",
      benefits: [
        t("aiDrinkType.tea.benefit1") || "Antioxidants",
        t("aiDrinkType.tea.benefit2") || "Calming",
        t("aiDrinkType.tea.benefit3") || "Digestive support"
      ]
    },
    {
      id: 'protein',
      title: `💪 ${t("aiDrinkType.protein.title") || "Protein Shake"}`,
      description: t("aiDrinkType.protein.desc") || "High-protein drinks for fitness and recovery",
      benefits: [
        t("aiDrinkType.protein.benefit1") || "Muscle support",
        t("aiDrinkType.protein.benefit2") || "Post-workout",
        t("aiDrinkType.protein.benefit3") || "Sustained energy"
      ]
    },
    {
      id: 'detox',
      title: `🌿 ${t("aiDrinkType.detox.title") || "Detox Drink"}`,
      description: t("aiDrinkType.detox.desc") || "Cleansing drinks with natural detoxifying ingredients",
      benefits: [
        t("aiDrinkType.detox.benefit1") || "Liver support",
        t("aiDrinkType.detox.benefit2") || "Cleansing",
        t("aiDrinkType.detox.benefit3") || "Anti-inflammatory"
      ]
    },
    {
      id: 'energy',
      title: `⚡ ${t("aiDrinkType.energy.title") || "Energy Boost"}`,
      description: t("aiDrinkType.energy.desc") || "Natural energy drinks without artificial stimulants",
      benefits: [
        t("aiDrinkType.energy.benefit1") || "Natural caffeine",
        t("aiDrinkType.energy.benefit2") || "B-vitamins",
        t("aiDrinkType.energy.benefit3") || "Sustained energy"
      ]
    }
  ];

  const handleSelect = (typeId: string) => {
    onUpdate('type', typeId);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-800 mb-2">
          {t("aiDrinkType.chooseTitle") || "Choose Your Drink Type"}
        </h2>
        <p className="text-green-600">
          {t("aiDrinkType.chooseDesc") || "Select the type of healthy drink you'd like to create"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drinkTypes.map((type) => (
          <Card 
            key={type.id}
            className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
              data.type === type.id ? 'border-green-500 bg-green-50' : 'border-green-200 hover:border-green-300'
            }`}
            onClick={() => handleSelect(type.id)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-800">{type.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-600 mb-3">{type.description}</p>
              <div className="space-y-1">
                {type.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center text-xs text-green-700">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                    {benefit}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AIDrinkType;
