import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AIDrinkTypeProps {
  data: any;
  onUpdate: (key: string, value: any) => void;
  onNext: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

const AIDrinkType = ({ data, onUpdate, onNext }: AIDrinkTypeProps) => {
  const drinkTypes = [
    {
      id: 'smoothie',
      title: '🥤 Smoothie',
      description: 'Thick, creamy blended drinks with fruits and vegetables',
      benefits: ['High in fiber', 'Filling', 'Easy to digest']
    },
    {
      id: 'juice',
      title: '🧃 Fresh Juice',
      description: 'Pure liquid extracted from fruits and vegetables',
      benefits: ['Quick absorption', 'Vitamin-rich', 'Hydrating']
    },
    {
      id: 'tea',
      title: '🍵 Wellness Tea',
      description: 'Herbal and functional teas for health benefits',
      benefits: ['Antioxidants', 'Calming', 'Digestive support']
    },
    {
      id: 'protein',
      title: '💪 Protein Shake',
      description: 'High-protein drinks for fitness and recovery',
      benefits: ['Muscle support', 'Post-workout', 'Sustained energy']
    },
    {
      id: 'detox',
      title: '🌿 Detox Drink',
      description: 'Cleansing drinks with natural detoxifying ingredients',
      benefits: ['Liver support', 'Cleansing', 'Anti-inflammatory']
    },
    {
      id: 'energy',
      title: '⚡ Energy Boost',
      description: 'Natural energy drinks without artificial stimulants',
      benefits: ['Natural caffeine', 'B-vitamins', 'Sustained energy']
    }
  ];

  const handleSelect = (typeId: string) => {
    onUpdate('type', typeId);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Choose Your Drink Type</h2>
        <p className="text-green-600">Select the type of healthy drink you'd like to create</p>
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
