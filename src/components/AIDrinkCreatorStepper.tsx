
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AIDrinkType from "./AIDrinkType";
import AIDrinkGoals from "./AIDrinkGoals";
import AIDrinkIngredients from "./AIDrinkIngredients";
import AIDrinkGeneration from "./AIDrinkGeneration";

interface AIDrinkCreatorStepperProps {
  onBack: () => void;
  onDrinkCreated: (drink: any) => void;
}

const AIDrinkCreatorStepper = ({ onBack, onDrinkCreated }: AIDrinkCreatorStepperProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [drinkData, setDrinkData] = useState({
    type: '',
    goals: [] as string[],
    ingredients: [] as string[],
    preferences: {} as any
  });

  const steps = [
    { number: 1, title: "Drink Type", component: AIDrinkType },
    { number: 2, title: "Health Goals", component: AIDrinkGoals },
    { number: 3, title: "Ingredients", component: AIDrinkIngredients },
    { number: 4, title: "AI Generation", component: AIDrinkGeneration },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateDrinkData = (key: string, value: any) => {
    setDrinkData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to AI Drinks
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-green-800">Create Healthy Drink</h1>
          <p className="text-green-600">Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-green-100 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>

      {/* Step Content */}
      <Card className="border-green-200">
        <CardContent className="p-6">
          <CurrentStepComponent 
            data={drinkData}
            onUpdate={updateDrinkData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onDrinkCreated={onDrinkCreated}
            isFirstStep={currentStep === 1}
            isLastStep={currentStep === steps.length}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      {currentStep < steps.length && (
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button 
            onClick={handleNext}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default AIDrinkCreatorStepper;
