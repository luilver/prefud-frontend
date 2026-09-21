import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, ArrowLeft, ArrowRight, Languages, ExternalLink, Activity, Apple, Sparkles, Check, Calendar as CalendarIcon } from "lucide-react";
import CountrySelect, { countries } from "./CountrySelect";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { getAuthHeaders } from "@/services/firebaseAuthService";
import { trackEvent } from "@/services/analytics";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://pantry-ms-brain.onrender.com';

interface UserProfileFormProps {
  onComplete: (profileData: any) => void;
  onBack: () => void;
  userId?: string;
  initialName?: string;
  authProvider?: 'apple' | 'google' | '';
  setCustomer: (customerId: string) => void;
  setUserId: (userId: string) => void;
}

const UserProfileForm = ({ onComplete, onBack, userId, initialName, authProvider, setCustomer, setUserId }: UserProfileFormProps) => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const splitName = (fullName?: string) => {
    if (!fullName) return { name: "", lastName: "" };
    const parts = fullName.trim().split(" ");
    const name = parts[0] || "";
    const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";
    return { name, lastName };
  };

  const initialNameParts = splitName(initialName);
  const isAppleSignIn = authProvider === 'apple';
  const hideNameFields = isAppleSignIn || !!initialName;

  // Generate a random name for Apple sign-in users when Apple doesn't provide one
  const generateRandomName = () => {
    const adjectives = ['Happy', 'Bright', 'Fresh', 'Healthy', 'Smart', 'Cool', 'Green', 'Sunny', 'Swift', 'Bold'];
    const nouns = ['Chef', 'Cook', 'Foodie', 'Planner', 'Gourmet', 'Taster', 'Baker', 'Eater', 'Diner', 'Picker'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return { name: adj, lastName: noun };
  };

  const [generatedName] = useState(() => generateRandomName());

  console.log("[UserProfileForm] initialName prop:", JSON.stringify(initialName), "authProvider:", authProvider, "hideNameFields:", hideNameFields, "split:", JSON.stringify(initialNameParts));

  const [formData, setFormData] = useState({
    name: initialNameParts.name,
    lastName: initialNameParts.lastName,
    country: "",
    phone: "",
    weight: "",
    heightMeters: "",
    birthday: "",
    selectedLanguage: language,
    healthGoals: [] as string[],
    dailyCalories: "2000",
    dietTypes: [] as string[],
    allergies: [] as string[],
    acceptedTerms: false
  });

  const healthGoalsOptions = [
    { id: "loseWeight", label: t("signup.healthGoalsList.loseWeight") || "Lose weight" },
    { id: "gainMuscle", label: t("signup.healthGoalsList.gainMuscle") || "Gain muscle" },
    { id: "maintainWeight", label: t("signup.healthGoalsList.maintainWeight") || "Maintain weight" },
    { id: "improveEnergy", label: t("signup.healthGoalsList.improveEnergy") || "Improve energy" },
    { id: "betterDigestion", label: t("signup.healthGoalsList.betterDigestion") || "Better digestion" },
    { id: "heartHealth", label: t("signup.healthGoalsList.heartHealth") || "Heart health" },
    { id: "lowerCholesterol", label: t("signup.healthGoalsList.lowerCholesterol") || "Lower cholesterol" },
    { id: "manageDiabetes", label: t("signup.healthGoalsList.manageDiabetes") || "Manage diabetes" },
  ];

  const dietTypesOptions = [
    { id: "vegetarian", label: t("signup.diet.vegetarian") || "Vegetarian" },
    { id: "vegan", label: t("signup.diet.vegan") || "Vegan" },
    { id: "pescatarian", label: t("signup.diet.pescatarian") || "Pescatarian" },
    { id: "keto", label: t("signup.diet.keto") || "Keto" },
    { id: "paleo", label: t("signup.diet.paleo") || "Paleo" },
    { id: "mediterranean", label: t("signup.diet.mediterranean") || "Mediterranean" },
    { id: "lowCarb", label: t("signup.diet.lowCarb") || "Low-carb" },
    { id: "glutenFree", label: t("signup.diet.glutenFree") || "Gluten-free" },
    { id: "dairyFree", label: t("signup.diet.dairyFree") || "Dairy-free" },
    { id: "noRestrictions", label: t("signup.diet.noRestrictions") || "No restrictions" },
  ];

  const allergiesOptions = [
    { id: "nuts", label: t("signup.allergy.nuts") || "Nuts" },
    { id: "shellfish", label: t("signup.allergy.shellfish") || "Shellfish" },
    { id: "dairy", label: t("signup.allergy.dairy") || "Dairy" },
    { id: "eggs", label: t("signup.allergy.eggs") || "Eggs" },
    { id: "soy", label: t("signup.allergy.soy") || "Soy" },
    { id: "gluten", label: t("signup.allergy.gluten") || "Gluten" },
    { id: "fish", label: t("signup.allergy.fish") || "Fish" },
    { id: "sesame", label: t("signup.allergy.sesame") || "Sesame" },
    { id: "none", label: t("signup.allergy.none") || "None" },
  ];

  const languageOptions = [
    { value: 'en', label: t('language.english') || 'English', flag: '🇺🇸' },
    { value: 'es', label: t('language.spanish') || 'Spanish', flag: '🇪🇸' },
    { value: 'pt', label: t('language.portuguese') || 'Portuguese', flag: '🇵🇹' }
  ];

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!hideNameFields) {
        if (!formData.name.trim()) errors.name = (t("signup.firstName") || "First Name") + " is required";
        if (!formData.lastName.trim()) errors.lastName = (t("signup.lastName") || "Last Name") + " is required";
      }
      if (!formData.phone.trim()) errors.phone = (t("signup.phoneNumber") || "Phone Number") + " is required";
      
      if (formData.birthday) {
        const birthDate = new Date(formData.birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          errors.birthday = t("signup.ageError.description") || "You must be at least 18 years old to create an account.";
        }
      }
    } else if (step === 2) {
      if (!formData.weight) errors.weight = (t("signup.weight") || "Weight") + " is required";
      if (!formData.heightMeters) errors.heightMeters = (t("signup.heightPlaceholder") || "Height") + " is required";
    } else if (step === 3) {
      if (!formData.acceptedTerms) {
        errors.acceptedTerms = "Please accept the Terms and Conditions to continue.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;

    if (!userId) {
      toast({
        title: "❌ Error",
        description: "User ID is missing. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Update global language when form is submitted
      setLanguage(formData.selectedLanguage as 'en' | 'es' | 'pt');
      
      const selectedCountry = countries.find(c => c.code === formData.country);
      const phoneWithoutPrefix = formData.phone;
      const phonePrefix = selectedCountry?.prefix || '';

      // Prepare data for API
      // When Apple sign-in doesn't provide a name, use a generated random name
      let effectiveName = formData.name;
      let effectiveLastName = formData.lastName;
      if (isAppleSignIn && !effectiveName) {
        effectiveName = initialNameParts.name || generatedName.name;
        effectiveLastName = initialNameParts.lastName || generatedName.lastName;
      }

      const profileData = {
        name: effectiveName,
        lastName: effectiveLastName,
        weight: parseFloat(formData.weight) || 0,
        height: parseFloat(formData.heightMeters) || 0,
        birthday: formData.birthday,
        healthGoals: {
          dailyCaloriesGoal: parseInt(formData.dailyCalories) || 0,
          goals: formData.healthGoals
        },
        dietTypes: formData.dietTypes,
        alergies: formData.allergies, // API expects 'alergies'
        language: formData.selectedLanguage,
        phone: phoneWithoutPrefix,
        phonePrefix: phonePrefix,
        country: selectedCountry?.name || formData.country,
        addressId: ""
      };

      const headers = await getAuthHeaders();
      const config = {
        method: 'post',
        url: `${API_BASE_URL}/user-profile/${userId}`,
        headers,
        data: profileData
      };

      const response = await axios.request(config);

      setCustomer(response.data.profile.ruku_client_id);
      setUserId(response.data.profile.userId);

      if (response.data.responseCode === "01" && response.data.profile) {
        toast({
          title: "✅ Profile Created Successfully!",
          description: "Your profile has been saved.",
          duration: 5000,
        });

        onComplete({
          ...formData,
          phone: phoneWithoutPrefix,
          phonePrefix: phonePrefix,
          weight: parseFloat(formData.weight) || 0,
          heightMeters: parseFloat(formData.heightMeters) || 0,
          dailyCalories: parseInt(formData.dailyCalories) || 0,
          language: formData.selectedLanguage,
          apiResponse: response.data.profile
        });
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error: any) {
      console.error('Profile creation failed:', error);
      const errorMessage = error.response?.data?.message || 'Profile creation failed';
      
      toast({
        title: "❌ Profile Creation Failed",
        description: typeof errorMessage === 'string' ? errorMessage : errorMessage.message || 'Unable to save profile.',
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChipSelect = (category: 'healthGoals' | 'allergies', value: string) => {
    setFormData(prev => {
      let newValues = [...prev[category]];
      const noneValue = category === 'allergies' ? allergiesOptions.find(o => o.id === 'none')?.label : null;

      if (value === noneValue) {
        return { ...prev, [category]: [value] };
      }

      if (newValues.includes(value)) {
        newValues = newValues.filter(item => item !== value);
      } else {
        newValues.push(value);
      }

      if (category === 'allergies' && noneValue && newValues.includes(noneValue)) {
        newValues = newValues.filter(item => item !== noneValue);
      }
      
      return { ...prev, [category]: newValues };
    });
  };

  const handleSingleChipSelect = (category: 'dietTypes', value: string) => {
    setFormData(prev => ({ ...prev, [category]: [value] }));
  };

  const selectedCountry = countries.find(c => c.code === formData.country);

  const stepsInfo = [
    {
      title: t("signup.step1Title") || "Let's start with the basics",
      subtitle: t("signup.step1Subtitle") || "Identity & Language",
      icon: User
    },
    {
      title: t("signup.step2Title") || "Where are you now, and what do you want to achieve?",
      subtitle: t("signup.step2Subtitle") || "Body & Goals",
      icon: Activity
    },
    {
      title: t("signup.step3Title") || "Let's tailor your plate.",
      subtitle: t("signup.step3Subtitle") || "Nutrition & Preferences",
      icon: Apple
    }
  ];

  const CurrentIcon = stepsInfo[currentStep - 1].icon;

  return (
    <>
    <Card className="max-w-full sm:max-w-2xl mx-auto bg-white/95 backdrop-blur-md shadow-xl border-border rounded-2xl overflow-hidden transition-all duration-500">
      <div className="h-2 w-full bg-gray-100">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500" 
          style={{ width: `${(currentStep / 3) * 100}%` }}
        />
      </div>
      <CardHeader className="px-6 py-8 text-center sm:text-left bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl shadow-sm text-primary">
            <CurrentIcon className="h-8 w-8" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm font-medium text-primary mb-2">
              <Sparkles className="h-4 w-4" />
              AI Nutritionist Interview
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-800">
              {stepsInfo[currentStep - 1].title}
            </CardTitle>
            <CardDescription className="text-base text-gray-500">
              {stepsInfo[currentStep - 1].subtitle} • Step {currentStep} of 3
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-6 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {currentStep === 1 && (
            <div className="space-y-6">
              {hideNameFields ? (
                <div className="space-y-2 bg-muted/50 p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2">
                    <Apple className="h-5 w-5 text-foreground" />
                    <Label className="text-sm font-medium text-foreground">{t("signup.fullName") || "Full Name"}</Label>
                  </div>
                  {initialName ? (
                    <p className="text-lg font-semibold text-foreground">{initialName}</p>
                  ) : (
                    <>
                      <p className="text-lg font-semibold text-foreground">{generatedName.name} {generatedName.lastName}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("signup.nameLinkedFromApple") || "Your name is linked from your Apple ID"}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-foreground">{t("signup.firstName") || "First Name"}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => { setFormData(prev => ({ ...prev, name: e.target.value })); setFormErrors(prev => { const { name, ...rest } = prev; return rest; }); }}
                      className={`h-12 bg-background border-border focus:border-primary focus:ring-primary/20 transition-all ${formErrors.name ? 'border-destructive focus:border-destructive' : ''}`}
                      placeholder="e.g. John"
                    />
                    {formErrors.name && <p className="text-destructive text-xs">{formErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-foreground">{t("signup.lastName") || "Last Name"}</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => { setFormData(prev => ({ ...prev, lastName: e.target.value })); setFormErrors(prev => { const { lastName, ...rest } = prev; return rest; }); }}
                      className={`h-12 bg-background border-border focus:border-primary focus:ring-primary/20 transition-all ${formErrors.lastName ? 'border-destructive focus:border-destructive' : ''}`}
                      placeholder="e.g. Doe"
                    />
                    {formErrors.lastName && <p className="text-destructive text-xs">{formErrors.lastName}</p>}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium text-foreground">{t("signup.country") || "Country"}</Label>
                <CountrySelect
                  value={formData.country}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                  placeholder={t("signup.countryPlaceholder") || "Select your country"}
                  className="h-12 bg-background border-border focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">{t("signup.phoneNumber") || "Phone Number"}</Label>
                <div className="flex space-x-2">
                  <div className="w-24">
                    <Input
                      value={selectedCountry ? selectedCountry.prefix : ''}
                      disabled
                      className="h-12 bg-muted border-border text-center font-medium"
                    />
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setFormData((prev) => ({ ...prev, phone: value }));
                      setFormErrors(prev => { const { phone, ...rest } = prev; return rest; });
                    }}
                    placeholder={t("signup.phoneNumberPlaceholder") || "Enter phone number"}
                    className={`flex-1 h-12 bg-background border-border focus:border-primary focus:ring-primary/20 transition-all ${formErrors.phone ? 'border-destructive focus:border-destructive' : ''}`}
                  />
                </div>
                {formErrors.phone && <p className="text-destructive text-xs">{formErrors.phone}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="birthday" className="text-sm font-medium text-foreground">{t("signup.birthday") || "Birthday"}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal bg-background border-border hover:bg-muted/50",
                          !formData.birthday && "text-muted-foreground",
                          formErrors.birthday && "border-destructive focus:border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.birthday ? (
                          format(new Date(formData.birthday + 'T12:00:00'), "PPP")
                        ) : (
                          <span>{t("signup.birthdayPlaceholder") || "Pick a date"}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.birthday ? new Date(formData.birthday + 'T12:00:00') : undefined}
                        onSelect={(date) => {
                          const dateString = date ? format(date, "yyyy-MM-dd") : "";
                          setFormData(prev => ({ ...prev, birthday: dateString }));
                          setFormErrors(prev => { const { birthday, ...rest } = prev; return rest; });
                        }}
                        initialFocus
                        defaultMonth={new Date(2000, 0)}
                      />
                    </PopoverContent>
                  </Popover>
                  {formErrors.birthday && <p className="text-destructive text-xs">{formErrors.birthday}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Languages className="h-4 w-4 text-primary" />
                    {t('signup.language.title') || "App Language"}
                  </Label>
                  <Select
                    value={formData.selectedLanguage}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, selectedLanguage: value as Language }))}
                  >
                    <SelectTrigger className="h-12 bg-background border-border focus:border-primary focus:ring-primary/20 transition-all">
                      <SelectValue placeholder={t('signup.language.select') || "Select language"} />
                    </SelectTrigger>
                    <SelectContent>
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
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3 bg-muted/50 p-4 rounded-xl border border-border">
                  <Label htmlFor="weight" className="text-sm font-semibold text-foreground">{t("signup.weight") || "Weight (lbs)"}</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => { setFormData(prev => ({ ...prev, weight: e.target.value })); setFormErrors(prev => { const { weight, ...rest } = prev; return rest; }); }}
                    className={`h-12 bg-background ${formErrors.weight ? 'border-destructive focus:border-destructive' : ''}`}
                    placeholder="e.g. 70"
                  />
                  {formErrors.weight && <p className="text-destructive text-xs">{formErrors.weight}</p>}
                </div>
                <div className="space-y-3 bg-muted/50 p-4 rounded-xl border border-border">
                  <Label htmlFor="heightMeters" className="text-sm font-semibold text-foreground">{t("signup.heightPlaceholder") || "Height (meters)"}</Label>
                  <Input
                    id="heightMeters"
                    type="number"
                    step="0.01"
                    min="0"
                    max="3"
                    value={formData.heightMeters}
                    onChange={(e) => { setFormData(prev => ({ ...prev, heightMeters: e.target.value })); setFormErrors(prev => { const { heightMeters, ...rest } = prev; return rest; }); }}
                    className={`h-12 bg-background ${formErrors.heightMeters ? 'border-destructive focus:border-destructive' : ''}`}
                    placeholder="e.g. 1.75"
                  />
                  {formErrors.heightMeters && <p className="text-destructive text-xs">{formErrors.heightMeters}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold text-foreground">{t("signup.healthGoals") || "Health Goals"}</Label>
                <div className="flex flex-wrap gap-2">
                  {healthGoalsOptions.map((goal) => {
                    const isSelected = formData.healthGoals.includes(goal.label);
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => handleChipSelect('healthGoals', goal.label)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border flex items-center gap-1.5
                          ${isSelected 
                            ? 'bg-primary text-primary-foreground border-primary shadow-md transform scale-105' 
                            : 'bg-background text-foreground border-border hover:border-primary hover:bg-primary/5'}`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                        {goal.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="space-y-6 bg-accent/5 p-5 rounded-xl border border-accent/20">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <Label className="text-base font-semibold text-foreground">{t("signup.dailyCaloriesGoal") || "Daily Calories Target"}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={formData.dailyCalories}
                      onChange={(e) => setFormData(prev => ({ ...prev, dailyCalories: e.target.value }))}
                      className="w-24 h-10 text-center font-bold text-primary border-primary/20 focus:border-primary bg-background"
                    />
                    <span className="text-sm text-muted-foreground font-medium">kcal</span>
                  </div>
                </div>
                <Slider
                  defaultValue={[2000]}
                  max={5000}
                  min={800}
                  step={50}
                  value={[parseInt(formData.dailyCalories) || 2000]}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, dailyCalories: val[0].toString() }))}
                  className="py-4 cursor-grab active:cursor-grabbing"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {t("signup.caloriesRange") || "Recommended range: 1200-3000 calories per day"}              
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-base font-semibold text-foreground">{t("signup.dietaryPreferences") || "Dietary Preference"}</Label>
                <div className="flex flex-wrap gap-2">
                  {dietTypesOptions.map((diet) => {
                    const isSelected = formData.dietTypes.includes(diet.label);
                    return (
                      <button
                        key={diet.id}
                        type="button"
                        onClick={() => handleSingleChipSelect('dietTypes', diet.label)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border flex items-center gap-1.5
                          ${isSelected 
                            ? 'bg-primary text-primary-foreground border-primary shadow-md transform scale-105' 
                            : 'bg-background text-foreground border-border hover:border-primary hover:bg-primary/5'}`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                        {diet.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold text-foreground">{t("signup.allergiesRestrictions") || "Allergies & Restrictions"}</Label>
                <div className="flex flex-wrap gap-2">
                  {allergiesOptions.map((allergy) => {
                    const isSelected = formData.allergies.includes(allergy.label);
                    return (
                      <button
                        key={allergy.id}
                        type="button"
                        onClick={() => handleChipSelect('allergies', allergy.label)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border flex items-center gap-1.5
                          ${isSelected 
                            ? 'bg-accent text-accent-foreground border-accent shadow-md transform scale-105' 
                            : 'bg-background text-foreground border-border hover:border-accent hover:bg-accent/5'}`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                        {allergy.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 bg-muted/30 p-5 rounded-xl border border-border mt-6">
                <h3 className="text-sm font-semibold text-foreground">{t("signup.agreement") || "Terms & AI Consent"}</h3>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptedTerms}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({ ...prev, acceptedTerms: !!checked }));
                      setFormErrors(prev => { const { acceptedTerms, ...rest } = prev; return rest; });
                    }}
                    className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-1"
                  />
                  <div className="space-y-1.5 flex-1">
                    <Label htmlFor="terms" className="text-sm text-foreground cursor-pointer leading-relaxed">
                      {t("signup.agreementText") || "I agree to the "}{' '}
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}
                        className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                      >
                        {t("signup.termsAndConditions") || "Terms and Conditions"}
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </Label>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t("signup.agreementDescription") || "By checking this box, you acknowledge that you have read and agree to our terms, including the use of AI for personalized meal planning."}
                    </p>
                    {formErrors.acceptedTerms && <p className="text-destructive text-xs mt-1">{formErrors.acceptedTerms}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-border mt-8 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
              className="w-1/3 sm:w-auto min-w-[120px] h-12 border-border text-foreground hover:bg-muted rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back') || 'Back'}
            </Button>
            
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1 sm:flex-none sm:min-w-[160px] h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                {t('common.continue') || 'Continue'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!formData.acceptedTerms || isLoading}
                className="flex-1 sm:flex-none sm:min-w-[200px] h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all group"
                onClick={async ()=> {
                  trackEvent('button_click', {
                    button_name: 'step3_signup_submit',
                    screen: 'signup_page',
                  })
                }}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Profile...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>{t('pagination.next') || 'Next'}</span>
                    <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  </div>
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
    
    <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
          <DialogDescription>
            Last updated: {new Date().toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm text-foreground/90 space-y-4">
          <h3 className="font-bold text-base">1. Agreement to Terms</h3>
          <p>
            By accessing and using Prefud ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by the above, please do not use this service.
          </p>
          <p>
            These Terms and Conditions govern your use of our AI-powered meal planning service, including but not limited to 
            meal recommendations, ingredient tracking, shopping list generation, and related features.
          </p>
          <h3 className="font-bold text-base">2. AI-Powered Services</h3>
          <p>
            Prefud utilizes artificial intelligence and machine learning technologies to provide personalized meal recommendations, 
            nutritional analysis, and cooking suggestions. You acknowledge and agree that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>AI-generated meal plans and recipes are suggestions based on available data and algorithms</li>
            <li>Nutritional information provided is approximate and should not replace professional dietary advice</li>
            <li>Food safety recommendations are general guidelines and may not cover all scenarios</li>
            <li>Individual dietary restrictions, allergies, and health conditions should always be considered</li>
            <li>You are responsible for verifying ingredient safety and suitability for your specific needs</li>
          </ul>
          <p>
            We continuously improve our AI models, but cannot guarantee 100% accuracy in all recommendations. 
            Always use your judgment and consult healthcare professionals for specific dietary needs.
          </p>
        </div>
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => setShowTermsModal(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default UserProfileForm;
