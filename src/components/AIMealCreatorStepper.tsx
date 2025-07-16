
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Sparkles, Clock, Users, ChefHat, Utensils } from "lucide-react";
import { useForm } from "react-hook-form";
import { useUser } from "@/contexts/UserContext";
import AIMealPreferences from "./AIMealPreferences";
import AIMealIngredients from "./AIMealIngredients";
import AIMealGeneration from "./AIMealGeneration";

interface AIMealCreatorStepperProps {
  onBack: () => void;
  onMealCreated: (meal: any) => void;
}

const AIMealCreatorStepper = ({ onBack, onMealCreated }: AIMealCreatorStepperProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [mealData, setMealData] = useState<any>({});
  const { user } = useUser();

  const form = useForm({
    defaultValues: {
      mealType: "",
      servings: 2,
      cookingTime: 30,
      dietaryRestrictions: [],
      cuisinePreference: "",
      ingredients: [],
      specialRequests: ""
    }
  });

  const steps = [
    { id: 1, title: "Meal Type", description: "What kind of meal?" },
    { id: 2, title: "Preferences", description: "Your dietary needs" },
    { id: 3, title: "Ingredients", description: "Available ingredients" },
    { id: 4, title: "Generate", description: "AI creates your meal" }
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

  const handleStepData = (stepData: any) => {
    setMealData(prev => ({ ...prev, ...stepData }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Utensils className="h-5 w-5 text-purple-600" />
                <span>What type of meal would you like?</span>
              </CardTitle>
              <CardDescription>
                Tell us about the meal you want to create
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...form}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Appetizer", "Beverage", "Custom"].map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={mealData.mealType === type ? "default" : "outline"}
                      onClick={() => handleStepData({ mealType: type })}
                      className="h-20 flex flex-col space-y-1"
                    >
                      <span className="font-medium">{type}</span>
                    </Button>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <FormField
                    control={form.control}
                    name="servings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>Servings</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(e);
                              handleStepData({ servings: parseInt(e.target.value) });
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cookingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Cooking Time (mins)</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(e);
                              handleStepData({ cookingTime: parseInt(e.target.value) });
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any specific requests or inspirations for your meal?"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleStepData({ specialRequests: e.target.value });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
            </CardContent>
          </Card>
        );

      case 2:
        return <AIMealPreferences onDataChange={handleStepData} initialData={mealData} />;

      case 3:
        return <AIMealIngredients onDataChange={handleStepData} initialData={mealData} />;

      case 4:
        return <AIMealGeneration mealData={mealData} onMealCreated={onMealCreated} />;

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to AI Meals</span>
        </Button>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h1 className="text-xl font-semibold">Create AI Meal</h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
              ${currentStep >= step.id 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {step.id}
            </div>
            <div className="ml-3 hidden sm:block">
              <p className="text-sm font-medium">{step.title}</p>
              <p className="text-xs text-gray-600">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div className={`
                ml-4 w-12 h-0.5 
                ${currentStep > step.id ? 'bg-purple-600' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button 
            onClick={handleNext}
            disabled={currentStep === 1 && !mealData.mealType}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default AIMealCreatorStepper;
