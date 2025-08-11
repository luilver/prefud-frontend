
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Users, Clock, DollarSign, ChefHat } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AIDrinkGoalsProps {
  data: any;
  onUpdate: (key: string, value: any) => void;
  onNext: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

const AIDrinkGoals = ({ data, onUpdate, onNext }: AIDrinkGoalsProps) => {
  const { t } = useLanguage();

  const [drinkName, setDrinkName] = useState(data.drink_name || "");
  const [numberPeople, setNumberPeople] = useState(data.numberPeople || 1);
  const [maxCookingTime, setMaxCookingTime] = useState(data.maxCookingTime || 30);
  const [cookingSkillLevel, setCookingSkillLevel] = useState(data.cookingSkillLevel || "");
  const [budgetRange, setBudgetRange] = useState(data.budgetRange || "");
  const [dislikes, setDislikes] = useState(data.dislikes || "");

  const healthGoals = [
    {
      id: 'energy-boost',
      title: t("aiDrinkGoals.energyBoost.title") || 'Energy Boost',
      description: t("aiDrinkGoals.energyBoost.desc") || 'Natural ingredients for sustained energy',
      icon: '⚡'
    },
    {
      id: 'weight-loss',
      title: t("aiDrinkGoals.weightLoss.title") || 'Weight Management',
      description: t("aiDrinkGoals.weightLoss.desc") || 'Low-calorie, metabolism-boosting ingredients',
      icon: '⚖️'
    },
    {
      id: 'immunity',
      title: t("aiDrinkGoals.immunity.title") || 'Immune Support',
      description: t("aiDrinkGoals.immunity.desc") || 'Vitamin C, antioxidants, and immune-boosting nutrients',
      icon: '🛡️'
    },
    {
      id: 'digestive-health',
      title: t("aiDrinkGoals.digestiveHealth.title") || 'Digestive Health',
      description: t("aiDrinkGoals.digestiveHealth.desc") || 'Fiber, probiotics, and gut-friendly ingredients',
      icon: '🌱'
    },
    {
      id: 'skin-health',
      title: t("aiDrinkGoals.skinHealth.title") || 'Skin Health',
      description: t("aiDrinkGoals.skinHealth.desc") || 'Antioxidants and vitamins for glowing skin',
      icon: '✨'
    },
    {
      id: 'detox',
      title: t("aiDrinkGoals.detox.title") || 'Detoxification',
      description: t("aiDrinkGoals.detox.desc") || 'Cleansing ingredients to support natural detox',
      icon: '🌿'
    }
  ];

  const dietaryRestrictions = [
    { id: 'keto', label: t("aiDrinkGoals.diet.keto") || 'Keto', color: 'bg-purple-500' },
    { id: 'paleo', label: t("aiDrinkGoals.diet.paleo") || 'Paleo', color: 'bg-orange-500' },
    { id: 'vegan', label: t("aiDrinkGoals.diet.vegan") || 'Vegan', color: 'bg-green-500' },
    { id: 'vegetarian', label: t("aiDrinkGoals.diet.vegetarian") || 'Vegetarian', color: 'bg-green-400' },
    { id: 'gluten-free', label: t("aiDrinkGoals.diet.glutenFree") || 'Gluten Free', color: 'bg-yellow-500' },
    { id: 'dairy-free', label: t("aiDrinkGoals.diet.dairyFree") || 'Dairy Free', color: 'bg-blue-500' },
    { id: 'low-carb', label: t("aiDrinkGoals.diet.lowCarb") || 'Low Carb', color: 'bg-red-500' },
    { id: 'diabetic-friendly', label: t("aiDrinkGoals.diet.diabeticFriendly") || 'Diabetic Friendly', color: 'bg-teal-500' }
  ];

  const cuisinePreferences = [
    { id: "ecuadorian", label: t("aiDrinkGoals.cuisine.ecuadorian") || "Ecuadorian" },
    { id: "american", label: t("aiDrinkGoals.cuisine.american") || "American" },
    { id: "japanese", label: t("aiDrinkGoals.cuisine.japanese") || "Japanese" },
    { id: "mexican", label: t("aiDrinkGoals.cuisine.mexican") || "Mexican" },
    { id: "italian", label: t("aiDrinkGoals.cuisine.italian") || "Italian" },
    { id: "indian", label: t("aiDrinkGoals.cuisine.indian") || "Indian" },
    { id: "thai", label: t("aiDrinkGoals.cuisine.thai") || "Thai" },
    { id: "chinese", label: t("aiDrinkGoals.cuisine.chinese") || "Chinese" },
    { id: "mediterranean", label: t("aiDrinkGoals.cuisine.mediterranean") || "Mediterranean" },
    { id: "french", label: t("aiDrinkGoals.cuisine.french") || "French" },
    { id: "korean", label: t("aiDrinkGoals.cuisine.korean") || "Korean" },
    { id: "brazilian", label: t("aiDrinkGoals.cuisine.brazilian") || "Brazilian" }
    ];

  const allergiesOptions = [
    { id: "peanuts", label: t("aiDrinkGoals.allergy.peanuts") || "Peanuts" },
    { id: "tree-nuts", label: t("aiDrinkGoals.allergy.treeNuts") || "Tree Nuts" },
    { id: "dairy", label: t("aiDrinkGoals.allergy.dairy") || "Dairy" },
    { id: "eggs", label: t("aiDrinkGoals.allergy.eggs") || "Eggs" },
    { id: "soy", label: t("aiDrinkGoals.allergy.soy") || "Soy" },
    { id: "shellfish", label: t("aiDrinkGoals.allergy.shellfish") || "Shellfish" },
    { id: "fish", label: t("aiDrinkGoals.allergy.fish") || "Fish" },
    { id: "wheat", label: t("aiDrinkGoals.allergy.wheat") || "Wheat" },
    { id: "sesame", label: t("aiDrinkGoals.allergy.sesame") || "Sesame" },
    { id: "sulfites", label: t("aiDrinkGoals.allergy.sulfites") || "Sulfites" }
  ];

  const cookingSkillLevels = [
    { id: "beginner", label: t("aiDrinkGoals.cookingSkill.beginner") || "Beginner" },
    { id: "intermediate", label: t("aiDrinkGoals.cookingSkill.intermediate") || "Intermediate" },
    { id: "advanced", label: t("aiDrinkGoals.cookingSkill.advanced") || "Advanced" },
    { id: "expert", label: t("aiDrinkGoals.cookingSkill.expert") || "Expert" }
  ];
  const budgetRanges = [
    { id: "low", label: t("aiDrinkGoals.budget.low") || "Low" },
    { id: "medium", label: t("aiDrinkGoals.budget.medium") || "Medium" },
    { id: "high", label: t("aiDrinkGoals.budget.high") || "High" }
  ];
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
        <h2 className="text-3xl font-bold text-green-800 mb-2">
          {t("aiDrinkGoals.customizeTitle") || "Customize Your Healthy Drink"}
        </h2>
        <p className="text-green-600">
          {t("aiDrinkGoals.customizeDesc") || "Tell us about your preferences to create the perfect drink"}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("aiDrinkGoals.basicInfo") || "Basic Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="drinkName" className="text-green-700">
                {t("aiDrinkGoals.drinkName") || "Drink Name"} *
              </Label>
              <Input
                id="drinkName"
                placeholder={t("aiDrinkGoals.drinkNamePlaceholder") || "e.g., Morning Energy Smoothie"}
                value={drinkName}
                onChange={(e) => setDrinkName(e.target.value)}
                className="border-green-300 focus:border-green-500"
              />
            </div>

            <div>
              <Label htmlFor="numberPeople" className="text-green-700">
                {t("aiDrinkGoals.numberPeople") || "Number of People"}
              </Label>
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
                {t("aiDrinkGoals.maxPrepTime") || "Max Preparation Time"}
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
                {t("aiDrinkGoals.cookingSkillLevel") || "Cooking Skill Level"}
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {cookingSkillLevels.map((level) => (
                  <Badge
                    key={level.id}
                    variant={cookingSkillLevel === level.id ? "default" : "outline"}
                    className={`cursor-pointer ${
                      cookingSkillLevel === level.id
                        ? 'bg-green-500 text-white'
                        : 'border-green-300 text-green-700 hover:bg-green-50'
                    }`}
                    onClick={() => setCookingSkillLevel(level.id)}
                  >
                    {level.label.charAt(0).toUpperCase() + level.label.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-green-700 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t("aiDrinkGoals.budgetRange") || "Budget Range"}
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {budgetRanges.map((range) => (
                  <Badge
                    key={range.id}
                    variant={budgetRange === range.id ? "default" : "outline"}
                    className={`cursor-pointer ${
                      budgetRange === range.id
                        ? 'bg-green-500 text-white'
                        : 'border-green-300 text-green-700 hover:bg-green-50'
                    }`}
                    onClick={() => setBudgetRange(range.id)}
                  >
                    {range.label.charAt(0).toUpperCase() + range.label.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Goals */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">
              {t("aiDrinkGoals.healthGoals") || "Health Goals"} *
            </CardTitle>
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
            <CardTitle className="text-green-800">
              {t("aiDrinkGoals.dietaryRestrictions") || "Dietary Restrictions"}
            </CardTitle>
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
            <CardTitle className="text-green-800">
              {t("aiDrinkGoals.cuisinePreferences") || "Cuisine Preferences"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {cuisinePreferences.map((cuisine) => (
                <Badge
                  key={cuisine.id}
                  variant={(data.cuisinePreferences || []).includes(cuisine.id) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    (data.cuisinePreferences || []).includes(cuisine.id)
                      ? 'bg-blue-500 text-white'
                      : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                  }`}
                  onClick={() => toggleSelection('cuisinePreferences', cuisine.id)}
                >
                  {cuisine.label.charAt(0).toUpperCase() + cuisine.label.slice(1)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Allergies & Intolerances */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">
              {t("aiDrinkGoals.allergies") || "Allergies & Intolerances"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allergiesOptions.map((allergy) => (
                <Badge
                  key={allergy.id}
                  variant={(data.allergiesIntolerance || []).includes(allergy.id) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    (data.allergiesIntolerance || []).includes(allergy.id)
                      ? 'bg-red-500 text-white'
                      : 'border-red-300 text-red-700 hover:bg-red-50'
                  }`}
                  onClick={() => toggleSelection('allergiesIntolerance', allergy.id)}
                >
                  {allergy.label.charAt(0).toUpperCase() + allergy.label.slice(1)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dislikes */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">
              {t("aiDrinkGoals.foodDislikes") || "Food Dislikes"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="dislikes" className="text-green-700">
                {t("aiDrinkGoals.foodDislikesLabel") || "What foods would you like to avoid?"}
              </Label>
              <Textarea
                id="dislikes"
                placeholder={t("aiDrinkGoals.foodDislikesPlaceholder") || "e.g., cabbage, spicy foods, bitter ingredients..."}
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
          {t("aiDrinkGoals.next") || "Next"}
        </Button>
        {!isValid && (
          <p className="text-red-500 text-sm mt-2">
            {t("aiDrinkGoals.validation") || "Please select at least one health goal and provide a drink name"}
          </p>
        )}
      </div>
    </div>
  );
};

export default AIDrinkGoals;
