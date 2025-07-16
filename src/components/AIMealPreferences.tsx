
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Leaf, Wheat, Fish, Beef, Apple } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface AIMealPreferencesProps {
  onDataChange: (data: any) => void;
  initialData: any;
}

const AIMealPreferences = ({ onDataChange, initialData }: AIMealPreferencesProps) => {
  const { user } = useUser();
  const [selectedDietary, setSelectedDietary] = useState<string[]>(
    initialData.dietaryRestrictions || user?.preferences?.dietaryRestrictions || []
  );
  const [selectedCuisine, setSelectedCuisine] = useState(
    initialData.cuisinePreference || user?.preferences?.cuisinePreferences?.[0] || ""
  );
  const [allergies, setAllergies] = useState<string[]>(
    initialData.allergies || user?.preferences?.allergies || []
  );

  const dietaryOptions = [
    { id: "vegetarian", label: "Vegetarian", icon: Leaf },
    { id: "vegan", label: "Vegan", icon: Apple },
    { id: "gluten-free", label: "Gluten Free", icon: Wheat },
    { id: "dairy-free", label: "Dairy Free", icon: Heart },
    { id: "pescatarian", label: "Pescatarian", icon: Fish },
    { id: "keto", label: "Keto", icon: Beef },
  ];

  const cuisineOptions = [
    "Italian", "Mexican", "Asian", "Mediterranean", "Indian", "American",
    "French", "Thai", "Chinese", "Japanese", "Greek", "Middle Eastern"
  ];

  const commonAllergies = [
    "Nuts", "Peanuts", "Shellfish", "Eggs", "Dairy", "Soy", "Fish", "Wheat"
  ];

  useEffect(() => {
    onDataChange({
      dietaryRestrictions: selectedDietary,
      cuisinePreference: selectedCuisine,
      allergies: allergies
    });
  }, [selectedDietary, selectedCuisine, allergies, onDataChange]);

  const toggleDietary = (option: string) => {
    setSelectedDietary(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(item => item !== allergy)
        : [...prev, allergy]
    );
  };

  return (
    <div className="space-y-6">
      {/* Dietary Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle>Dietary Restrictions</CardTitle>
          <CardDescription>
            Select any dietary restrictions or preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {dietaryOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedDietary.includes(option.id);
              return (
                <Button
                  key={option.id}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => toggleDietary(option.id)}
                  className="h-16 flex flex-col space-y-1"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{option.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cuisine Preference */}
      <Card>
        <CardHeader>
          <CardTitle>Cuisine Preference</CardTitle>
          <CardDescription>
            What cuisine style would you like for this meal?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {cuisineOptions.map((cuisine) => (
              <Button
                key={cuisine}
                type="button"
                variant={selectedCuisine === cuisine ? "default" : "outline"}
                onClick={() => setSelectedCuisine(cuisine)}
                className="h-12"
              >
                {cuisine}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card>
        <CardHeader>
          <CardTitle>Allergies & Intolerances</CardTitle>
          <CardDescription>
            Select any ingredients to avoid
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {commonAllergies.map((allergy) => (
              <Button
                key={allergy}
                type="button"
                variant={allergies.includes(allergy) ? "destructive" : "outline"}
                onClick={() => toggleAllergy(allergy)}
                className="h-12"
              >
                {allergy}
              </Button>
            ))}
          </div>
          <div className="mt-4">
            <Label htmlFor="customAllergy">Custom Allergy/Intolerance</Label>
            <Input
              id="customAllergy"
              placeholder="Enter any other ingredients to avoid"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  toggleAllergy(e.currentTarget.value.trim());
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIMealPreferences;
