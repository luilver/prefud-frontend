import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserProfileFormProps {
  onComplete: (profileData: any) => void;
  onBack: () => void;
}

const UserProfileForm = ({ onComplete, onBack }: UserProfileFormProps) => {
  const [formData, setFormData] = useState({
    weight: "",
    heightFeet: "",
    heightInches: "",
    birthday: "",
    healthGoals: [] as string[],
    dietTypes: [] as string[],
    allergies: [] as string[],
  });

  const healthGoalOptions = [
    "Weight Loss",
    "Muscle Gain",
    "Maintain Weight",
    "Improve Energy",
    "Better Sleep",
    "Heart Health",
  ];

  const dietTypeOptions = [
    "Vegetarian",
    "Vegan",
    "Keto",
    "Paleo",
    "Mediterranean",
    "Low Carb",
    "Gluten Free",
  ];

  const allergyOptions = [
    "Nuts",
    "Dairy",
    "Eggs",
    "Soy",
    "Shellfish",
    "Fish",
    "Wheat",
  ];

  const handleCheckboxChange = (category: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [category]: checked 
        ? [...prev[category as keyof typeof prev] as string[], value]
        : (prev[category as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const profileData = {
      weight: parseInt(formData.weight),
      heightFeet: parseInt(formData.heightFeet),
      heightInches: parseInt(formData.heightInches),
      birthday: formData.birthday,
      healthGoals: formData.healthGoals,
      dietTypes: formData.dietTypes,
      allergies: formData.allergies,
    };
    
    onComplete(profileData);
  };

  return (
    <Card className="max-w-full sm:max-w-2xl mx-auto bg-white/90 backdrop-blur-sm">
      <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
        <CardTitle className="text-lg sm:text-xl">Tell Us About Yourself</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Help us personalize your meal planning experience
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight" className="text-sm sm:text-base">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                required
                className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base mt-1"
                placeholder="150"
              />
            </div>
            
            <div>
              <Label className="text-sm sm:text-base">Height</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  type="number"
                  value={formData.heightFeet}
                  onChange={(e) => setFormData(prev => ({ ...prev, heightFeet: e.target.value }))}
                  required
                  className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base"
                  placeholder="5"
                  min="0"
                  max="8"
                />
                <span className="flex items-center text-sm text-gray-600">ft</span>
                <Input
                  type="number"
                  value={formData.heightInches}
                  onChange={(e) => setFormData(prev => ({ ...prev, heightInches: e.target.value }))}
                  required
                  className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base"
                  placeholder="10"
                  min="0"
                  max="11"
                />
                <span className="flex items-center text-sm text-gray-600">in</span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="birthday" className="text-sm sm:text-base">Birthday</Label>
            <Input
              id="birthday"
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
              required
              className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base mt-1"
            />
          </div>

          <div>
            <Label className="text-sm sm:text-base">Health Goals</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {healthGoalOptions.map(goal => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={`health-goal-${goal}`}
                    checked={formData.healthGoals.includes(goal)}
                    onCheckedChange={(checked) => handleCheckboxChange("healthGoals", goal, checked === true)}
                  />
                  <Label htmlFor={`health-goal-${goal}`} className="text-sm sm:text-base font-normal">
                    {goal}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm sm:text-base">Diet Types</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {dietTypeOptions.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`diet-type-${type}`}
                    checked={formData.dietTypes.includes(type)}
                    onCheckedChange={(checked) => handleCheckboxChange("dietTypes", type, checked === true)}
                  />
                  <Label htmlFor={`diet-type-${type}`} className="text-sm sm:text-base font-normal">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm sm:text-base">Allergies</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {allergyOptions.map(allergy => (
                <div key={allergy} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergy-${allergy}`}
                    checked={formData.allergies.includes(allergy)}
                    onCheckedChange={(checked) => handleCheckboxChange("allergies", allergy, checked === true)}
                  />
                  <Label htmlFor={`allergy-${allergy}`} className="text-sm sm:text-base font-normal">
                    {allergy}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 h-10 sm:h-12 text-sm sm:text-base"
            >
              Continue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;
