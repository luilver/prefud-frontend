
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, User, Heart, Target, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

interface UserProfileFormProps {
  onComplete: (profileData: any) => void;
  onBack: () => void;
}

const UserProfileForm = ({ onComplete, onBack }: UserProfileFormProps) => {
  const [profileData, setProfileData] = useState({
    name: "",
    lastName: "",
    phonePrefix: "+1",
    phone: "",
    weight: "",
    heightFeet: "",
    heightInches: "",
    birthday: "",
    healthGoals: [] as string[],
    dietTypes: [] as string[],
    allergies: [] as string[],
    acceptTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const healthGoalOptions = [
    "Weight Loss",
    "Weight Gain", 
    "Muscle Building",
    "Heart Health",
    "Diabetes Management",
    "General Wellness"
  ];

  const dietTypeOptions = [
    "Vegetarian",
    "Vegan", 
    "Keto",
    "Paleo",
    "Mediterranean",
    "Gluten-Free"
  ];

  const allergyOptions = [
    "Nuts",
    "Shellfish",
    "Dairy",
    "Eggs",
    "Soy",
    "Fish"
  ];

  const phonePrefixes = [
    { value: "+1", label: "+1 (US/CA)" },
    { value: "+44", label: "+44 (UK)" },
    { value: "+33", label: "+33 (FR)" },
    { value: "+49", label: "+49 (DE)" },
    { value: "+34", label: "+34 (ES)" },
    { value: "+39", label: "+39 (IT)" },
    { value: "+55", label: "+55 (BR)" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!profileData.name.trim()) {
      return;
    }
    if (!profileData.lastName.trim()) {
      return;
    }
    if (!profileData.acceptTerms) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate processing
    setTimeout(() => {
      onComplete(profileData);
      setIsLoading(false);
    }, 500);
  };

  const handleCheckboxChange = (category: 'healthGoals' | 'dietTypes' | 'allergies', value: string, checked: boolean) => {
    setProfileData(prev => ({
      ...prev,
      [category]: checked 
        ? [...prev[category], value]
        : prev[category].filter(item => item !== value)
    }));
  };

  return (
    <Card className="max-w-full sm:max-w-2xl mx-auto bg-white/90 backdrop-blur-sm">
      <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg sm:text-xl flex items-center space-x-2">
              <User className="h-5 w-5 text-green-600" />
              <span>{t('signup.profile.title')}</span>
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-1">
              {t('signup.profile.description')}
            </CardDescription>
          </div>
          <Button variant="ghost" onClick={onBack} className="flex items-center space-x-1">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.back')}</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-sm sm:text-base">
                {t('signup.profile.name')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="lastName" className="text-sm sm:text-base">
                {t('signup.profile.lastName')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                required
                className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base mt-1"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <Label className="text-sm sm:text-base">{t('signup.profile.phone')}</Label>
            <div className="flex space-x-2 mt-1">
              <Select 
                value={profileData.phonePrefix} 
                onValueChange={(value) => setProfileData(prev => ({ ...prev, phonePrefix: value }))}
              >
                <SelectTrigger className="w-32 border-green-200 focus:border-green-400 h-10 sm:h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {phonePrefixes.map((prefix) => (
                    <SelectItem key={prefix.value} value={prefix.value}>
                      {prefix.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="1234567890"
                className="flex-1 border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Physical Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="weight" className="text-sm sm:text-base">{t('signup.profile.weight')}</Label>
              <Input
                id="weight"
                type="number"
                value={profileData.weight}
                onChange={(e) => setProfileData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="lbs"
                className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="heightFeet" className="text-sm sm:text-base">{t('signup.profile.height')}</Label>
              <Input
                id="heightFeet"
                type="number"
                value={profileData.heightFeet}
                onChange={(e) => setProfileData(prev => ({ ...prev, heightFeet: e.target.value }))}
                placeholder="ft"
                className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="heightInches" className="text-sm sm:text-base">{t('signup.profile.inches')}</Label>
              <Input
                id="heightInches"
                type="number"
                value={profileData.heightInches}
                onChange={(e) => setProfileData(prev => ({ ...prev, heightInches: e.target.value }))}
                placeholder="in"
                min="0"
                max="11"
                className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base mt-1"
              />
            </div>
          </div>

          {/* Birthday */}
          <div>
            <Label htmlFor="birthday" className="text-sm sm:text-base">{t('signup.profile.birthday')}</Label>
            <Input
              id="birthday"
              type="date"
              value={profileData.birthday}
              onChange={(e) => setProfileData(prev => ({ ...prev, birthday: e.target.value }))}
              className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base mt-1"
            />
          </div>

          {/* Health Goals */}
          <div>
            <Label className="text-sm sm:text-base flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-600" />
              <span>{t('signup.profile.healthGoals')}</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {healthGoalOptions.map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={`health-${goal}`}
                    checked={profileData.healthGoals.includes(goal)}
                    onCheckedChange={(checked) => handleCheckboxChange('healthGoals', goal, !!checked)}
                  />
                  <Label htmlFor={`health-${goal}`} className="text-sm">{goal}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Diet Types */}
          <div>
            <Label className="text-sm sm:text-base flex items-center space-x-2">
              <Heart className="h-4 w-4 text-green-600" />
              <span>{t('signup.profile.dietTypes')}</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {dietTypeOptions.map((diet) => (
                <div key={diet} className="flex items-center space-x-2">
                  <Checkbox
                    id={`diet-${diet}`}
                    checked={profileData.dietTypes.includes(diet)}
                    onCheckedChange={(checked) => handleCheckboxChange('dietTypes', diet, !!checked)}
                  />
                  <Label htmlFor={`diet-${diet}`} className="text-sm">{diet}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <Label className="text-sm sm:text-base flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>{t('signup.profile.allergies')}</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {allergyOptions.map((allergy) => (
                <div key={allergy} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergy-${allergy}`}
                    checked={profileData.allergies.includes(allergy)}
                    onCheckedChange={(checked) => handleCheckboxChange('allergies', allergy, !!checked)}
                  />
                  <Label htmlFor={`allergy-${allergy}`} className="text-sm">{allergy}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="acceptTerms"
                checked={profileData.acceptTerms}
                onCheckedChange={(checked) => setProfileData(prev => ({ ...prev, acceptTerms: !!checked }))}
                className="mt-0.5"
              />
              <Label htmlFor="acceptTerms" className="text-sm leading-relaxed">
                <span className="text-red-500">*</span> I agree to the{' '}
                <Button
                  type="button"
                  variant="link"
                  className="text-green-600 hover:text-green-700 p-0 font-semibold text-sm underline"
                  onClick={() => navigate('/terms')}
                >
                  Terms and Conditions
                </Button>
                {' '}and understand that AI-generated meal plans are for informational purposes only and should not replace professional medical advice.
              </Label>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 h-10 sm:h-12 text-sm sm:text-base"
            disabled={isLoading || !profileData.name.trim() || !profileData.lastName.trim() || !profileData.acceptTerms}
          >
            {isLoading ? t('signup.profile.completing') : t('signup.profile.continue')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;
