import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, ArrowLeft, Languages, ExternalLink } from "lucide-react";
import CountrySelect, { countries } from "./CountrySelect";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

interface UserProfileFormProps {
  onComplete: (profileData: any) => void;
  onBack: () => void;
}

const UserProfileForm = ({ onComplete, onBack }: UserProfileFormProps) => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    country: "",
    phone: "",
    weight: "",
    heightFeet: "",
    heightInches: "",
    birthday: "",
    selectedLanguage: language,
    healthGoals: [] as string[],
    dietTypes: [] as string[],
    allergies: [] as string[],
    acceptedTerms: false
  });

  const healthGoalsOptions = [
    "Lose weight", "Gain muscle", "Maintain weight", "Improve energy",
    "Better digestion", "Heart health", "Lower cholesterol", "Manage diabetes"
  ];

  const dietTypesOptions = [
    "Vegetarian", "Vegan", "Pescatarian", "Keto", "Paleo", "Mediterranean",
    "Low-carb", "Gluten-free", "Dairy-free", "No restrictions"
  ];

  const allergiesOptions = [
    "Nuts", "Shellfish", "Dairy", "Eggs", "Soy", "Gluten", "Fish", "Sesame", "None"
  ];

  const languageOptions = [
    { value: 'en', label: t('language.english'), flag: '🇺🇸' },
    { value: 'es', label: t('language.spanish'), flag: '🇪🇸' },
    { value: 'pt', label: t('language.portuguese'), flag: '🇵🇹' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptedTerms) {
      return; // Prevent submission if terms not accepted
    }
    
    // Update global language when form is submitted
    setLanguage(formData.selectedLanguage as 'en' | 'es' | 'pt');
    
    const selectedCountry = countries.find(c => c.code === formData.country);
    const phoneWithPrefix = selectedCountry ? `${selectedCountry.prefix}${formData.phone}` : formData.phone;
    
    onComplete({
      ...formData,
      phone: phoneWithPrefix,
      weight: parseFloat(formData.weight) || 0,
      heightFeet: parseInt(formData.heightFeet) || 0,
      heightInches: parseInt(formData.heightInches) || 0,
      language: formData.selectedLanguage
    });
  };

  const handleCheckboxChange = (category: 'healthGoals' | 'dietTypes' | 'allergies', value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const selectedCountry = countries.find(c => c.code === formData.country);

  return (
    <Card className="max-w-full sm:max-w-2xl mx-auto bg-white/90 backdrop-blur-sm">
      <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center space-x-2 mb-2">
          <User className="h-5 w-5 text-green-600" />
          <CardTitle className="text-lg sm:text-xl">Tell us about yourself</CardTitle>
        </div>
        <CardDescription className="text-sm sm:text-base">
          Help us personalize your meal planning experience
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="name" className="text-sm sm:text-base">First Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm sm:text-base">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                  className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country" className="text-sm sm:text-base">Country</Label>
              <CountrySelect
                value={formData.country}
                onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                placeholder="Select your country"
                className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number</Label>
              <div className="flex space-x-2 mt-1">
                <div className="w-20 sm:w-24">
                  <Input
                    value={selectedCountry ? selectedCountry.prefix : ''}
                    disabled
                    className="border-green-200 bg-gray-50 h-10 sm:h-12 text-sm sm:text-base text-center"
                  />
                </div>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  required
                  className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base flex-1"
                />
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
          </div>

          {/* Language Preference */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2">
              <Languages className="h-4 w-4 text-green-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">{t('signup.language.title')}</h3>
            </div>
            <p className="text-sm text-gray-600">{t('signup.language.description')}</p>
            <Select
              value={formData.selectedLanguage}
              onValueChange={(value) => setFormData(prev => ({ ...prev, selectedLanguage: value as Language }))}
            >
              <SelectTrigger className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base">
                <SelectValue placeholder={t('signup.language.select')} />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{option.flag}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Physical Information */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Physical Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="weight" className="text-sm sm:text-base">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base mt-1"
                />
              </div>
              <div>
                <Label htmlFor="heightFeet" className="text-sm sm:text-base">Height (feet)</Label>
                <Input
                  id="heightFeet"
                  type="number"
                  min="0"
                  max="8"
                  value={formData.heightFeet}
                  onChange={(e) => setFormData(prev => ({ ...prev, heightFeet: e.target.value }))}
                  className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base mt-1"
                />
              </div>
              <div>
                <Label htmlFor="heightInches" className="text-sm sm:text-base">Height (inches)</Label>
                <Input
                  id="heightInches"
                  type="number"
                  min="0"
                  max="11"
                  value={formData.heightInches}
                  onChange={(e) => setFormData(prev => ({ ...prev, heightInches: e.target.value }))}
                  className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base mt-1"
                />
              </div>
            </div>
          </div>

          {/* Health Goals */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Health Goals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {healthGoalsOptions.map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={`goal-${goal}`}
                    checked={formData.healthGoals.includes(goal)}
                    onCheckedChange={() => handleCheckboxChange('healthGoals', goal)}
                    className="border-green-300 data-[state=checked]:bg-green-500"
                  />
                  <Label htmlFor={`goal-${goal}`} className="text-sm sm:text-base cursor-pointer">
                    {goal}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Diet Types */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Dietary Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dietTypesOptions.map((diet) => (
                <div key={diet} className="flex items-center space-x-2">
                  <Checkbox
                    id={`diet-${diet}`}
                    checked={formData.dietTypes.includes(diet)}
                    onCheckedChange={() => handleCheckboxChange('dietTypes', diet)}
                    className="border-green-300 data-[state=checked]:bg-green-500"
                  />
                  <Label htmlFor={`diet-${diet}`} className="text-sm sm:text-base cursor-pointer">
                    {diet}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Allergies & Restrictions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allergiesOptions.map((allergy) => (
                <div key={allergy} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergy-${allergy}`}
                    checked={formData.allergies.includes(allergy)}
                    onCheckedChange={() => handleCheckboxChange('allergies', allergy)}
                    className="border-green-300 data-[state=checked]:bg-green-500"
                  />
                  <Label htmlFor={`allergy-${allergy}`} className="text-sm sm:text-base cursor-pointer">
                    {allergy}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-3 sm:space-y-4 border-t pt-4 sm:pt-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Agreement</h3>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={formData.acceptedTerms}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptedTerms: !!checked }))}
                className="border-green-300 data-[state=checked]:bg-green-500 mt-1"
              />
              <div className="space-y-1">
                <Label htmlFor="terms" className="text-sm sm:text-base cursor-pointer leading-relaxed">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/terms-and-conditions')}
                    className="text-green-600 hover:text-green-700 underline inline-flex items-center gap-1"
                  >
                    Terms and Conditions
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </Label>
                <p className="text-xs text-gray-500">
                  By checking this box, you acknowledge that you have read and agree to our terms, including the use of AI for meal planning.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 border-green-500 text-green-600 hover:bg-green-50 h-10 sm:h-12 text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
            <Button
              type="submit"
              disabled={!formData.acceptedTerms}
              className="flex-1 bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed h-10 sm:h-12 text-sm sm:text-base"
            >
              {t('common.continue')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;
