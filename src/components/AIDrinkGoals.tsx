
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Users, Clock, DollarSign, ChefHat } from "lucide-react";

interface AIDrinkGoalsProps {
  data: any;
  onUpdate: (key: string, value: any) => void;
  onNext: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

const AIDrinkGoals = ({ data, onUpdate, onNext }: AIDrinkGoalsProps) => {
  const [drinkName, setDrinkName] = useState(data.drink_name || "");
  const [numberPeople, setNumberPeople] = useState(data.numberPeople || 1);
  const [maxCookingTime, setMaxCookingTime] = useState(data.maxCookingTime || 30);
  const [cookingSkillLevel, setCookingSkillLevel] = useState(data.cookingSkillLevel || "");
  const [budgetRange, setBudgetRange] = useState(data.budgetRange || "");
  const [dislikes, setDislikes] = useState(data.dislikes || "");

  const healthGoals = [
    {
      id: 'energy-boost',
      title: 'Energy Boost',
      description: 'Natural ingredients for sustained energy',
      icon: '⚡'
    },
    {
      id: 'weight-loss',
      title: 'Weight Management',
      description: 'Low-calorie, metabolism-boosting ingredients',
      icon: '⚖️'
    },
    {
      id: 'immunity',
      title: 'Immune Support',
      description: 'Vitamin C, antioxidants, and immune-boosting nutrients',
      icon: '🛡️'
    },
    {
      id: 'digestive-health',
      title: 'Digestive Health',
      description: 'Fiber, probiotics, and gut-friendly ingredients',
      icon: '🌱'
    },
    {
      id: 'skin-health',
      title: 'Skin Health',
      description: 'Antioxidants and vitamins for glowing skin',
      icon: '✨'
    },
    {
      id: 'detox',
      title: 'Detoxification',
      description: 'Cleansing ingredients to support natural detox',
      icon: '🌿'
    }
  ];

  const dietaryRestrictions = [
    { id: 'keto', label: 'Keto', color: 'bg-purple-500' },
    { id: 'paleo', label: 'Paleo', color: 'bg-orange-500' },
    { id: 'vegan', label: 'Vegan', color: 'bg-green-500' },
    { id: 'vegetarian', label: 'Vegetarian', color: 'bg-green-400' },
    { id: 'gluten-free', label: 'Gluten Free', color: 'bg-yellow-500' },
    { id: 'dairy-free', label: 'Dairy Free', color: 'bg-blue-500' },
    { id: 'low-carb', label: 'Low Carb', color: 'bg-red-500' },
    { id: 'diabetic-friendly', label: 'Diabetic Friendly', color: 'bg-teal-500' }
  ];

  const cuisinePreferences = [
    'ecuadorian', 'american', 'japanese', 'mexican', 'italian', 'indian', 
    'thai', 'chinese', 'mediterranean', 'french', 'korean', 'brazilian'
  ];

  const allergiesOptions = [
    'peanuts', 'tree nuts', 'dairy', 'eggs', 'soy', 'shellfish', 
    'fish', 'wheat', 'sesame', 'sulfites'
  ];

  const cookingSkillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const budgetRanges = ['low', 'medium', 'high'];
  const cookingTimes = [15, 30, 45, 60];

  const toggleSelection = (key: string, value: string) => {
    const currentArray = data[key] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item: string) => item !== value)
      : [...currentArray, value];
    onUpdate(key, newArray);
  };

  const handleInputChange = (key: string, value: any) => {
    onUpdate(key, value);
  };

  const handleNext = () => {
    // Update all the local state values
    onUpdate('drink_name', drinkName);
    onUpdate('numberPeople', numberPeople);
    onUpdate('maxCookingTime', maxCookingTime);
    onUpdate('cookingSkillLevel', cookingSkillLevel);
    onUpdate('budgetRange', budgetRange);
    onUpdate('dislikes', dislikes);
    
    if ((data.healthGoals || []).length > 0 && drinkName.trim()) {
      onNext();
    }
  };

  const isValid = (data.healthGoals || []).length > 0 && drinkName.trim();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-green-800 mb-2">Customize Your Healthy Drink</h2>
        <p className="text-green-600">Tell us about your preferences to create the perfect drink</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="drinkName" className="text-green-700">Drink Name *</Label>
              <Input
                id="drinkName"
                placeholder="e.g., Morning Energy Smoothie"
                value={drinkName}
                onChange={(e) => setDrinkName(e.target.value)}
                className="border-green-300 focus:border-green-500"
              />
            </div>

            <div>
              <Label htmlFor="numberPeople" className="text-green-700">Number of People</Label>
              <Input
                id="numberPeople"
                type="number"
                min="1"
                max="10"
                value={numberPeople}
                onChange={(e) => setNumberPeople(parseInt(e.target.value) || 1)}
                className="border-green-300 focus:border-green-500"
              />
            </div>

            <div>
              <Label className="text-green-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Max Preparation Time
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {cookingTimes.map((time) => (
                  <Badge
                    key={time}
                    variant={maxCookingTime === time ? "default" : "outline"}
                    className={`cursor-pointer ${
                      maxCookingTime === time
                        ? 'bg-green-500 text-white'
                        : 'border-green-300 text-green-700 hover:bg-green-50'
                    }`}
                    onClick={() => setMaxCookingTime(time)}
                  >
                    {time} min
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-green-700 flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                Cooking Skill Level
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {cookingSkillLevels.map((level) => (
                  <Badge
                    key={level}
                    variant={cookingSkillLevel === level ? "default" : "outline"}
                    className={`cursor-pointer ${
                      cookingSkillLevel === level
                        ? 'bg-green-500 text-white'
                        : 'border-green-300 text-green-700 hover:bg-green-50'
                    }`}
                    onClick={() => setCookingSkillLevel(level)}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-green-700 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Budget Range
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {budgetRanges.map((range) => (
                  <Badge
                    key={range}
                    variant={budgetRange === range ? "default" : "outline"}
                    className={`cursor-pointer ${
                      budgetRange === range
                        ? 'bg-green-500 text-white'
                        : 'border-green-300 text-green-700 hover:bg-green-50'
                    }`}
                    onClick={() => setBudgetRange(range)}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Goals */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Health Goals *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {healthGoals.map((goal) => (
                <Card
                  key={goal.id}
                  className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                    (data.healthGoals || []).includes(goal.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-green-200 hover:border-green-300'
                  }`}
                  onClick={() => toggleSelection('healthGoals', goal.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={(data.healthGoals || []).includes(goal.id)}
                        onChange={() => toggleSelection('healthGoals', goal.id)}
                      />
                      <span className="text-xl">{goal.icon}</span>
                      <div>
                        <h3 className="font-semibold text-green-800">{goal.title}</h3>
                        <p className="text-sm text-green-600">{goal.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dietary Restrictions */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Dietary Restrictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {dietaryRestrictions.map((diet) => (
                <Badge
                  key={diet.id}
                  variant={(data.dietaryRestrictions || []).includes(diet.id) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    (data.dietaryRestrictions || []).includes(diet.id)
                      ? `${diet.color} text-white`
                      : 'border-green-300 text-green-700 hover:bg-green-50'
                  }`}
                  onClick={() => toggleSelection('dietaryRestrictions', diet.id)}
                >
                  {diet.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cuisine Preferences */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Cuisine Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {cuisinePreferences.map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant={(data.cuisinePreferences || []).includes(cuisine) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    (data.cuisinePreferences || []).includes(cuisine)
                      ? 'bg-blue-500 text-white'
                      : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                  }`}
                  onClick={() => toggleSelection('cuisinePreferences', cuisine)}
                >
                  {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Allergies & Intolerances */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Allergies & Intolerances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allergiesOptions.map((allergy) => (
                <Badge
                  key={allergy}
                  variant={(data.allergiesIntolerance || []).includes(allergy) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    (data.allergiesIntolerance || []).includes(allergy)
                      ? 'bg-red-500 text-white'
                      : 'border-red-300 text-red-700 hover:bg-red-50'
                  }`}
                  onClick={() => toggleSelection('allergiesIntolerance', allergy)}
                >
                  {allergy.charAt(0).toUpperCase() + allergy.slice(1)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dislikes */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Food Dislikes</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="dislikes" className="text-green-700">What foods would you like to avoid?</Label>
              <Textarea
                id="dislikes"
                placeholder="e.g., cabbage, spicy foods, bitter ingredients..."
                value={dislikes}
                onChange={(e) => setDislikes(e.target.value)}
                className="border-green-300 focus:border-green-500 mt-2"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
        >
          Next
        </Button>
        {!isValid && (
          <p className="text-red-500 text-sm mt-2">
            Please select at least one health goal and provide a drink name
          </p>
        )}
      </div>
    </div>
  );
};

export default AIDrinkGoals;
