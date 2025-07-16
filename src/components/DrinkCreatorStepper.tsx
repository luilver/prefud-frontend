
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Sparkles, Coffee } from "lucide-react";

interface DrinkCreatorStepperProps {
  initialData?: any;
  onDrinkCreated: (drink: any) => void;
  onBack: () => void;
  isEditing?: boolean;
}

const DrinkCreatorStepper = ({ initialData, onDrinkCreated, onBack, isEditing = false }: DrinkCreatorStepperProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [drinkData, setDrinkData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || '',
    healthGoals: initialData?.healthGoals || [],
    dietaryRestrictions: initialData?.dietaryRestrictions || [],
    preferences: initialData?.preferences || {
      sweetness: 'medium',
      intensity: 'medium',
      people: 1,
      temperature: 'cold'
    },
    customInstructions: initialData?.customInstructions || ''
  });

  const healthGoalOptions = [
    'Weight Loss', 'Energy Boost', 'Detox', 'Immune Support', 
    'Digestive Health', 'Skin Health', 'Stress Relief', 'Post-Workout Recovery'
  ];

  const dietaryOptions = [
    'Vegan', 'Vegetarian', 'Dairy-Free', 'Gluten-Free', 
    'Keto', 'Low Sugar', 'Organic Only', 'Nut-Free'
  ];

  const drinkCategories = [
    'Smoothie', 'Juice', 'Tea', 'Coffee', 'Protein Shake', 
    'Detox Drink', 'Energy Drink', 'Infused Water'
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCreateDrink();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleCreateDrink = () => {
    // Simulate AI generation
    const newDrink = {
      id: initialData?.id || `drink-${Date.now()}`,
      ...drinkData,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Mock generated content
      ingredients: [
        { name: 'Spinach', amount: '2 cups', calories: 14 },
        { name: 'Banana', amount: '1 medium', calories: 105 },
        { name: 'Almond Milk', amount: '1 cup', calories: 40 },
        { name: 'Chia Seeds', amount: '1 tbsp', calories: 60 }
      ],
      instructions: [
        'Add spinach and almond milk to blender',
        'Add banana and chia seeds',
        'Blend until smooth and creamy',
        'Serve immediately for best taste'
      ],
      nutritionFacts: {
        calories: 219,
        protein: '6g',
        carbs: '42g',
        fat: '5g',
        fiber: '12g'
      },
      prepTime: '5',
      servings: drinkData.preferences.people,
      healthBenefits: ['High in Fiber', 'Rich in Antioxidants', 'Boosts Energy']
    };

    onDrinkCreated(newDrink);
  };

  const handleInputChange = (field: string, value: any) => {
    setDrinkData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferencesChange = (field: string, value: any) => {
    setDrinkData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={handlePrevious}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Edit Healthy Drink' : 'Create AI Healthy Drink'}
          </h1>
          <p className="text-gray-600">Step {currentStep} of 3</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / 3) * 100}%` }}
        />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-green-500" />
            {currentStep === 1 && "Basic Information"}
            {currentStep === 2 && "Health Goals & Preferences"}
            {currentStep === 3 && "Final Details"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Tell us about your drink preferences"}
            {currentStep === 2 && "What are your health goals and dietary needs?"}
            {currentStep === 3 && "Add any special instructions and review"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Drink Name (Optional)</Label>
                <Input
                  id="name"
                  placeholder="e.g., Green Energy Smoothie"
                  value={drinkData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="category">Drink Category</Label>
                <Select value={drinkData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {drinkCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="people">Number of Servings</Label>
                  <Select 
                    value={drinkData.preferences.people.toString()} 
                    onValueChange={(value) => handlePreferencesChange('people', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="temperature">Temperature</Label>
                  <Select 
                    value={drinkData.preferences.temperature} 
                    onValueChange={(value) => handlePreferencesChange('temperature', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cold">Cold</SelectItem>
                      <SelectItem value="room">Room Temperature</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="hot">Hot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Health Goals & Preferences */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Health Goals</Label>
                <p className="text-sm text-gray-600 mb-3">Select your primary health objectives</p>
                <div className="grid grid-cols-2 gap-3">
                  {healthGoalOptions.map(goal => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={drinkData.healthGoals.includes(goal)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleInputChange('healthGoals', [...drinkData.healthGoals, goal]);
                          } else {
                            handleInputChange('healthGoals', drinkData.healthGoals.filter(g => g !== goal));
                          }
                        }}
                      />
                      <Label htmlFor={goal} className="text-sm">{goal}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Dietary Restrictions</Label>
                <p className="text-sm text-gray-600 mb-3">Select any dietary preferences or restrictions</p>
                <div className="grid grid-cols-2 gap-3">
                  {dietaryOptions.map(dietary => (
                    <div key={dietary} className="flex items-center space-x-2">
                      <Checkbox
                        id={dietary}
                        checked={drinkData.dietaryRestrictions.includes(dietary)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleInputChange('dietaryRestrictions', [...drinkData.dietaryRestrictions, dietary]);
                          } else {
                            handleInputChange('dietaryRestrictions', drinkData.dietaryRestrictions.filter(d => d !== dietary));
                          }
                        }}
                      />
                      <Label htmlFor={dietary} className="text-sm">{dietary}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sweetness">Sweetness Level</Label>
                  <Select 
                    value={drinkData.preferences.sweetness} 
                    onValueChange={(value) => handlePreferencesChange('sweetness', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Sweetness</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="intensity">Flavor Intensity</Label>
                  <Select 
                    value={drinkData.preferences.intensity} 
                    onValueChange={(value) => handlePreferencesChange('intensity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="strong">Strong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Final Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="instructions">Custom Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Any specific preferences, ingredients to avoid, or special instructions..."
                  value={drinkData.customInstructions}
                  onChange={(e) => handleInputChange('customInstructions', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Ready to Create Your Healthy Drink!</h4>
                <p className="text-sm text-green-700">
                  Our AI will generate a personalized healthy drink recipe based on your preferences and health goals.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {currentStep === 1 ? 'Back to Drinks' : 'Previous'}
        </Button>
        
        <Button 
          onClick={handleNext}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white flex items-center gap-2"
        >
          {currentStep === 3 ? (
            <>
              <Sparkles className="h-4 w-4" />
              {isEditing ? 'Update Drink' : 'Create Drink'}
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DrinkCreatorStepper;
