import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface AIDrinkGoalsProps {
  data: any;
  onUpdate: (key: string, value: any) => void;
  onNext: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

const AIDrinkGoals = ({ data, onUpdate, onNext }: AIDrinkGoalsProps) => {
  const healthGoals = [
    {
      id: 'weight-loss',
      title: 'Weight Management',
      description: 'Low-calorie, metabolism-boosting ingredients',
      icon: '⚖️'
    },
    {
      id: 'energy',
      title: 'Energy Boost',
      description: 'Natural ingredients for sustained energy',
      icon: '⚡'
    },
    {
      id: 'immunity',
      title: 'Immune Support',
      description: 'Vitamin C, antioxidants, and immune-boosting nutrients',
      icon: '🛡️'
    },
    {
      id: 'digestion',
      title: 'Digestive Health',
      description: 'Fiber, probiotics, and gut-friendly ingredients',
      icon: '🌱'
    },
    {
      id: 'skin',
      title: 'Skin Health',
      description: 'Antioxidants and vitamins for glowing skin',
      icon: '✨'
    },
    {
      id: 'detox',
      title: 'Detoxification',
      description: 'Cleansing ingredients to support natural detox',
      icon: '🌿'
    },
    {
      id: 'muscle',
      title: 'Muscle Recovery',
      description: 'Protein and nutrients for post-workout recovery',
      icon: '💪'
    },
    {
      id: 'stress',
      title: 'Stress Relief',
      description: 'Adaptogens and calming ingredients',
      icon: '🧘'
    }
  ];

  const toggleGoal = (goalId: string) => {
    const currentGoals = data.goals || [];
    const newGoals = currentGoals.includes(goalId)
      ? currentGoals.filter((id: string) => id !== goalId)
      : [...currentGoals, goalId];
    onUpdate('goals', newGoals);
  };

  const handleNext = () => {
    if ((data.goals || []).length > 0) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Select Your Health Goals</h2>
        <p className="text-green-600">Choose one or more health goals to personalize your drink</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthGoals.map((goal) => (
          <Card 
            key={goal.id}
            className={`cursor-pointer transition-all hover:shadow-md border-2 ${
              (data.goals || []).includes(goal.id) 
                ? 'border-green-500 bg-green-50' 
                : 'border-green-200 hover:border-green-300'
            }`}
            onClick={() => toggleGoal(goal.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  checked={(data.goals || []).includes(goal.id)}
                  onChange={() => toggleGoal(goal.id)}
                />
                <span className="text-2xl">{goal.icon}</span>
                <CardTitle className="text-lg text-green-800">{goal.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-600">{goal.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button 
          onClick={handleNext}
          disabled={!(data.goals || []).length}
          className="bg-green-600 hover:bg-green-700 text-white px-8"
        >
          Continue with {(data.goals || []).length} goal{(data.goals || []).length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
};

export default AIDrinkGoals;
