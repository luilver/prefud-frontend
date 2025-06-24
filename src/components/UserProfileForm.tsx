import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User } from "lucide-react";

interface ProfileData {
  weight: number;
  height: number;
  birthday: string;
  healthGoals: string[];
  dietTypes: string[];
  allergies: string[];
  otherAllergies: string;
}

interface UserProfileFormProps {
  onComplete: (profileData: ProfileData) => void;
  onBack: () => void;
}

const UserProfileForm = ({ onComplete, onBack }: UserProfileFormProps) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    weight: 0,
    height: 0,
    birthday: "",
    healthGoals: [],
    dietTypes: [],
    allergies: [],
    otherAllergies: "",
  });

  const healthGoalOptions = [
    "Lose weight",
    "Gain weight",
    "Maintain weight",
    "Build muscle",
    "Improve energy",
    "Better nutrition",
    "Manage diabetes",
    "Lower cholesterol",
  ];

  const dietTypeOptions = [
    "No restrictions",
    "Vegetarian",
    "Vegan",
    "Keto",
    "Paleo",
    "Mediterranean",
    "Low carb",
    "Gluten-free",
  ];

  const allergyOptions = [
    "None",
    "Nuts",
    "Shellfish",
    "Dairy",
    "Eggs",
    "Soy",
    "Gluten",
    "Fish",
  ];

  const handleCheckboxChange = (category: keyof Pick<ProfileData, 'healthGoals' | 'dietTypes' | 'allergies'>, value: string, checked: boolean) => {
    setProfileData(prev => ({
      ...prev,
      [category]: checked 
        ? [...prev[category], value]
        : prev[category].filter(item => item !== value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Combine regular allergies with other allergies
    const finalAllergies = [...profileData.allergies];
    if (profileData.otherAllergies.trim()) {
      finalAllergies.push(profileData.otherAllergies.trim());
    }
    
    onComplete({
      ...profileData,
      allergies: finalAllergies
    });
  };

  return (
    <Card className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Complete Your Profile</span>
            </CardTitle>
            <CardDescription>Help us personalize your meal planning experience</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Metrics */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                value={profileData.weight || ""}
                onChange={(e) => setProfileData(prev => ({ ...prev, weight: Number(e.target.value) }))}
                required
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div>
              <Label htmlFor="height">Height (inches)</Label>
              <Input
                id="height"
                type="number"
                value={profileData.height || ""}
                onChange={(e) => setProfileData(prev => ({ ...prev, height: Number(e.target.value) }))}
                required
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div>
              <Label htmlFor="birthday">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                value={profileData.birthday}
                onChange={(e) => setProfileData(prev => ({ ...prev, birthday: e.target.value }))}
                required
                className="border-green-200 focus:border-green-400"
              />
            </div>
          </div>

          {/* Health Goals */}
          <div>
            <Label className="text-base font-medium mb-3 block">Health Goals</Label>
            <div className="grid md:grid-cols-2 gap-2">
              {healthGoalOptions.map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={`goal-${goal}`}
                    checked={profileData.healthGoals.includes(goal)}
                    onCheckedChange={(checked) => handleCheckboxChange('healthGoals', goal, checked as boolean)}
                  />
                  <Label htmlFor={`goal-${goal}`} className="text-sm">{goal}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Diet Types */}
          <div>
            <Label className="text-base font-medium mb-3 block">Dietary Preferences</Label>
            <div className="grid md:grid-cols-2 gap-2">
              {dietTypeOptions.map((diet) => (
                <div key={diet} className="flex items-center space-x-2">
                  <Checkbox
                    id={`diet-${diet}`}
                    checked={profileData.dietTypes.includes(diet)}
                    onCheckedChange={(checked) => handleCheckboxChange('dietTypes', diet, checked as boolean)}
                  />
                  <Label htmlFor={`diet-${diet}`} className="text-sm">{diet}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <Label className="text-base font-medium mb-3 block">Allergies & Restrictions</Label>
            <div className="grid md:grid-cols-2 gap-2 mb-4">
              {allergyOptions.map((allergy) => (
                <div key={allergy} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergy-${allergy}`}
                    checked={profileData.allergies.includes(allergy)}
                    onCheckedChange={(checked) => handleCheckboxChange('allergies', allergy, checked as boolean)}
                  />
                  <Label htmlFor={`allergy-${allergy}`} className="text-sm">{allergy}</Label>
                </div>
              ))}
            </div>
            
            {/* Other Allergies Input */}
            <div>
              <Label htmlFor="otherAllergies" className="text-sm font-medium mb-2 block">Other allergies (specify)</Label>
              <Textarea
                id="otherAllergies"
                placeholder="Enter any other allergies or dietary restrictions..."
                value={profileData.otherAllergies}
                onChange={(e) => setProfileData(prev => ({ ...prev, otherAllergies: e.target.value }))}
                className="border-green-200 focus:border-green-400 min-h-[80px]"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
          >
            Continue to Subscription
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;
