import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit2,
  Save,
  X,
  Languages,
  XCircle,
  LogOut,
  Calendar,
  Coffee,
  Utensils,
  Star,
  ChefHat,
  Trophy,
  Target,
  Flame,
  Leaf,
  TrendingDown,
  Activity,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import CountrySelect, { countries } from "./CountrySelect";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import PasswordUpdate from "./PasswordUpdate";
import SubscriptionCancelModal from "./SubscriptionCancelModal";
import { authService } from "@/services/authService";
import axios from "axios";

interface SubscriptionType {
  _id: string;
  name: string;
  price: number;
  mealPlans: number;
  healthyDrinks: number;
  specialMeals: number;
  generatedMeals: number;
}

interface CurrentSubscriptionInfo {
  userId: string;
  subscriptionTypeId: string;
  dayOfTheMonth: number;
  dateStarted: string;
  status: boolean;
  mealPlans: number;
  specialMeals: number;
  healthyDrinks: number;
  generateMeals: number;
  _id: string;
}

const UserProfile = () => {
  const { user, updateUserProfile, logout } = useUser();
  const { user: authUser } = useAuth();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);
  const [subscriptionTypes, setSubscriptionTypes] = useState<
    SubscriptionType[]
  >([]);
  const [currentSubscriptionName, setCurrentSubscriptionName] =
    useState<string>("");
  const [currentSubscriptionInfo, setCurrentSubscriptionInfo] = 
    useState<CurrentSubscriptionInfo | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    country: user?.country || "",
  });

  // Fetch subscription types and current subscription data on component mount
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        // Fetch subscription types
        const typesResponse = await axios.get(
          "https://pantry-auth-1.onrender.com/subscriptionType/all"
        );
        setSubscriptionTypes(typesResponse.data);

        // Fetch current subscription data using authService
        if (authUser?.userId) {
          const subscriptionData = await authService.getSubscription(authUser.userId);
          setCurrentSubscriptionInfo(subscriptionData);
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
      }
    };

    fetchSubscriptionData();
  }, [authUser?.userId]);

  // Find current subscription name and type based on subscriptionTypeId
  const [currentSubscriptionType, setCurrentSubscriptionType] = useState<SubscriptionType | null>(null);
  
  useEffect(() => {
    const subId = (authUser?.subscription?.subscriptionTypeId ?? "")
      .toString()
      .trim();
    console.log(
      "[UserProfile] authUser.subscription.subscriptionTypeId:",
      subId
    );
    console.log("[UserProfile] fetched subscriptionTypes:", subscriptionTypes);

    if (subscriptionTypes.length > 0) {
      if (subId) {
        // User has a subscription ID, find the matching subscription
        const currentSubscription = subscriptionTypes.find(
          (sub) => (sub._id ?? "").toString().trim() === subId
        );
        console.log("[UserProfile] matched subscription:", currentSubscription);
        setCurrentSubscriptionName(currentSubscription?.name || "Free");
        setCurrentSubscriptionType(currentSubscription || null);
      } else {
        // User has no subscription ID, they're on Free plan
        setCurrentSubscriptionName("Free");
        setCurrentSubscriptionType(null);
      }
    }
  }, [subscriptionTypes, authUser?.subscription?.subscriptionTypeId]);

  if (!user) return null;

  const handleSave = () => {
    updateUserProfile(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      country: user.country || "",
    });
    setIsEditing(false);
  };

  const handleCancelSubscription = () => {
    // Simulate switching to free plan
    setCurrentSubscriptionName("Free");
    setShowCancelModal(false);
  };

  const getLanguageDisplay = (langCode?: string) => {
    switch (langCode) {
      case "es":
        return { flag: "🇪🇸", name: t("language.spanish") };
      case "pt":
        return { flag: "🇵🇹", name: t("language.portuguese") };
      default:
        return { flag: "🇺🇸", name: t("language.english") };
    }
  };

  const getCountryDisplay = (countryCode?: string) => {
    const country = countries.find((c) => c.code === countryCode);
    return country
      ? { flag: country.flag, name: country.name, prefix: country.prefix }
      : null;
  };

  const languageDisplay = getLanguageDisplay(user.language);
  const countryDisplay = getCountryDisplay(user.country);

  // Check if user has an active subscription (not Free plan)
  const hasActiveSubscription =
    currentSubscriptionName && currentSubscriptionName.toLowerCase() !== "free";

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Profile Information Accordion */}
      <Card>
        <CardContent className="p-0">
          <Accordion type="single" collapsible>
            <AccordionItem value="profile-info" className="border-none">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  <span className="text-lg sm:text-xl font-semibold">
                    {t("profile.title") || "Profile Information"}
                  </span>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="border-green-500 text-green-600 hover:bg-green-50 ml-4"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    {t("profile.edit") || "Edit"}
                  </Button>
                )}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 sm:space-y-6">
                  {isEditing && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        className="border-gray-300 w-full sm:w-auto"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {t("common.cancel")}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {t("common.save")}
                      </Button>
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("profile.description") ||
                      "Manage your personal information and preferences"}
                  </p>

                  {/* Personal Information */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-medium">
                      {t("profile.personalInfo") || "Personal Information"}
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm">
                          {t("profile.fullName") || "Full Name"}
                        </Label>
                        {isEditing ? (
                          <Input
                            id="name"
                            value={editData.name}
                            onChange={(e) =>
                              setEditData((prev) => ({ ...prev, name: e.target.value }))
                            }
                            className="border-green-200 focus:border-green-400 text-sm"
                          />
                        ) : (
                          <div className="flex items-center space-x-2 p-2.5 sm:p-3 bg-gray-50 rounded-md">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                            <span className="text-sm truncate">{user.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm">
                          {t("profile.email") || "Email Address"}
                        </Label>
                        {isEditing ? (
                          <Input
                            id="email"
                            type="email"
                            value={editData.email}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            className="border-green-200 focus:border-green-400 text-sm"
                          />
                        ) : (
                          <div className="flex items-center space-x-2 p-2.5 sm:p-3 bg-gray-50 rounded-md">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                            <span className="text-sm truncate">{user.email}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-sm">
                          {t("profile.country")}
                        </Label>
                        {isEditing ? (
                          <CountrySelect
                            value={editData.country}
                            onValueChange={(value) =>
                              setEditData((prev) => ({ ...prev, country: value }))
                            }
                            placeholder={t("profile.selectCountry") || "Select country"}
                            className="border-green-200 focus:border-green-400 text-sm"
                          />
                        ) : (
                          <div className="flex items-center space-x-2 p-2.5 sm:p-3 bg-gray-50 rounded-md">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                            {authUser.profile ? (
                              <>
                                <span className="text-sm truncate">
                                  {authUser.profile.country}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-500 text-sm">
                                {t("profile.notSpecified") || "Not specified"}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm">
                          {t("profile.phone")}
                        </Label>
                        {isEditing ? (
                          <div className="flex space-x-2">
                            <div className="w-16 sm:w-20">
                              <Input
                                value={countryDisplay?.prefix || ""}
                                disabled
                                className="border-green-200 bg-gray-50 text-center text-sm"
                              />
                            </div>
                            <Input
                              id="phone"
                              type="tel"
                              value={editData.phone.replace(
                                countryDisplay?.prefix || "",
                                ""
                              )}
                              onChange={(e) =>
                                setEditData((prev) => ({
                                  ...prev,
                                  phone: `${countryDisplay?.prefix || ""}${
                                    e.target.value
                                  }`,
                                }))
                              }
                              className="border-green-200 focus:border-green-400 flex-1 text-sm"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 p-2.5 sm:p-3 bg-gray-50 rounded-md">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                            {countryDisplay && (
                              <span className="text-base sm:text-lg">
                                {countryDisplay.flag}
                              </span>
                            )}
                            <span className="text-sm truncate">
                              {user.phone ||
                                t("profile.notSpecified") ||
                                "Not specified"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Language Preference */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-medium">
                      {t("profile.languagePreference") || "Language Preference"}
                    </h3>
                    <div className="space-y-2">
                      <Label className="text-sm">{t("profile.language")}</Label>
                      <div className="flex items-center space-x-2 p-2.5 sm:p-3 bg-gray-50 rounded-md">
                        <Languages className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                        <span className="text-base sm:text-lg">
                          {languageDisplay.flag}
                        </span>
                        <span className="text-sm flex-1">{languageDisplay.name}</span>
                        <span className="text-xs text-gray-500 ml-auto hidden sm:inline">
                          {t("profile.cannotChange") || "(Cannot be changed)"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Subscription Information Accordion */}
      <Card>
        <CardContent className="p-0">
          <Accordion type="single" collapsible>
            <AccordionItem value="subscription-info" className="border-none">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  <span className="text-lg sm:text-xl font-semibold">
                    {t("profile.subscription") || "My Subscription"}
                  </span>
                  <div className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {currentSubscriptionName} Plan
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <p className="text-sm text-muted-foreground mb-4">
                  {t("profile.subscriptionDesc") || "Your current plan usage and limits"}
                </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Meal Plans */}
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="h-5 w-5 text-green-600" />
                 <div className="text-right">
                   <span className="text-xl font-bold text-green-600">
                     {currentSubscriptionInfo?.mealPlans || 0}
                   </span>
                   {currentSubscriptionType && (
                     <span className="text-lg text-gray-400">
                       /{currentSubscriptionType.mealPlans}
                     </span>
                   )}
                 </div>
              </div>
              <p className="text-sm font-medium text-gray-700">Meal Plans</p>
              <p className="text-xs text-gray-500">Available this month</p>
            </div>

            {/* Special Meals */}
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <Star className="h-5 w-5 text-blue-600" />
                 <div className="text-right">
                   <span className="text-xl font-bold text-blue-600">
                     {currentSubscriptionInfo?.specialMeals || 0}
                   </span>
                   {currentSubscriptionType && (
                     <span className="text-lg text-gray-400">
                       /{currentSubscriptionType.specialMeals}
                     </span>
                   )}
                 </div>
              </div>
              <p className="text-sm font-medium text-gray-700">Special Meals</p>
              <p className="text-xs text-gray-500">Premium recipes</p>
            </div>

            {/* Healthy Drinks */}
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <Coffee className="h-5 w-5 text-purple-600" />
                 <div className="text-right">
                   <span className="text-xl font-bold text-purple-600">
                     {currentSubscriptionInfo?.healthyDrinks || 0}
                   </span>
                   {currentSubscriptionType && (
                     <span className="text-lg text-gray-400">
                       /{currentSubscriptionType.healthyDrinks}
                     </span>
                   )}
                 </div>
              </div>
              <p className="text-sm font-medium text-gray-700">Healthy Drinks</p>
              <p className="text-xs text-gray-500">Custom beverages</p>
            </div>

            {/* Generated Meals */}
            <div className="bg-white rounded-lg p-4 border border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <ChefHat className="h-5 w-5 text-orange-600" />
                 <div className="text-right">
                   <span className="text-xl font-bold text-orange-600">
                     {currentSubscriptionInfo?.generateMeals || 0}
                   </span>
                   {currentSubscriptionType && (
                     <span className="text-lg text-gray-400">
                       /{currentSubscriptionType.generatedMeals}
                     </span>
                   )}
                 </div>
              </div>
              <p className="text-sm font-medium text-gray-700">Generated Meals</p>
              <p className="text-xs text-gray-500">AI-powered recipes</p>
            </div>
          </div>

          {/* Subscription Status */}
          <div className="mt-6 p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="font-medium">Plan Status</span>
              </div>
               <div className="flex items-center space-x-2">
                 <div className={`w-2 h-2 rounded-full ${currentSubscriptionInfo?.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                 <span className={`text-sm font-medium ${currentSubscriptionInfo?.status ? 'text-green-600' : 'text-red-600'}`}>
                   {currentSubscriptionInfo?.status ? 'Active' : 'Inactive'}
                 </span>
               </div>
            </div>
             {currentSubscriptionInfo?.dateStarted && (
               <p className="text-xs text-gray-500 mt-2">
                 Started: {new Date(currentSubscriptionInfo.dateStarted).toLocaleDateString()}
               </p>
             )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Calorie Tracking Accordion */}
      <Card>
        <CardContent className="p-0">
          <Accordion type="single" collapsible>
            <AccordionItem value="calorie-tracking" className="border-none">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center space-x-2">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                  <span className="text-lg sm:text-xl font-semibold">
                    {t("profile.calorieTracking.title") || "Calorie Tracking"}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <p className="text-sm text-muted-foreground mb-4">
                  {t("profile.calorieTracking.description") || "Track your monthly calorie consumption and goals"}
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Daily Goal */}
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      <span className="text-2xl font-bold text-orange-600">
                        {authUser?.profile?.healthGoals?.dailyCaloriesGoal || 2000}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{t("profile.calorieTracking.dailyGoal") || "Daily Goal"}</p>
                    <p className="text-xs text-gray-500">{t("profile.calorieTracking.caloriesPerDay") || "Calories per day"}</p>
                  </div>

                  {/* Monthly Consumed */}
                  <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="h-5 w-5 text-red-600" />
                      <span className="text-2xl font-bold text-red-600">
                        24,680
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{t("profile.calorieTracking.thisMonth") || "This Month"}</p>
                    <p className="text-xs text-gray-500">{t("profile.calorieTracking.caloriesConsumed") || "Calories consumed"}</p>
                  </div>

                  {/* Average Daily */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingDown className="h-5 w-5 text-blue-600" />
                      <span className="text-2xl font-bold text-blue-600">
                        1,956
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{t("profile.calorieTracking.dailyAverage") || "Daily Average"}</p>
                    <p className="text-xs text-gray-500">{t("profile.calorieTracking.thisMonth") || "This month"}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-base font-medium mb-3">{t("profile.calorieTracking.healthGoalsProgress") || "Health Goals Progress"}</h4>
                  <div className="space-y-2">
                    {["Gain muscle", "Lose weight", "Better digestion", "Heart health"].map((goal, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">{goal}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.floor(Math.random() * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Environmental Impact Accordion */}
      <Card>
        <CardContent className="p-0">
          <Accordion type="single" collapsible>
            <AccordionItem value="environmental-impact" className="border-none">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center space-x-2">
                  <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  <span className="text-lg sm:text-xl font-semibold">
                    {t("profile.environmental.title") || "Environmental Impact"}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <p className="text-sm text-muted-foreground mb-4">
                  {t("profile.environmental.description") || "Track your monthly carbon emissions from ingredients and meals"}
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  {/* Expired Ingredients Impact */}
                  <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                    <div className="flex items-center justify-between mb-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div className="text-right">
                        <span className="text-2xl font-bold text-red-600">2.4</span>
                        <span className="text-sm text-gray-500 ml-1">kg CO₂</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{t("profile.environmental.expiredIngredients") || "Expired Ingredients"}</p>
                    <p className="text-xs text-gray-500">{t("profile.environmental.carbonWasted") || "Carbon footprint wasted"}</p>
                  </div>

                  {/* Consumed Meals Impact */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <Utensils className="h-5 w-5 text-green-600" />
                      <div className="text-right">
                        <span className="text-2xl font-bold text-green-600">8.7</span>
                        <span className="text-sm text-gray-500 ml-1">kg CO₂</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{t("profile.environmental.consumedMeals") || "Consumed Meals"}</p>
                    <p className="text-xs text-gray-500">{t("profile.environmental.carbonUsed") || "Carbon footprint used"}</p>
                  </div>
                </div>

                {/* Total Monthly Impact */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <Leaf className="h-6 w-6 text-blue-600" />
                    <div className="text-right">
                      <span className="text-3xl font-bold text-blue-600">11.1</span>
                      <span className="text-lg text-gray-500 ml-1">kg CO₂</span>
                    </div>
                  </div>
                  <p className="text-base font-medium text-gray-700">{t("profile.environmental.totalMonthly") || "Total Monthly Impact"}</p>
                  <p className="text-sm text-gray-500">{t("profile.environmental.combinedFootprint") || "Combined carbon footprint"}</p>
                </div>

                {/* Environmental Tips */}
                <div className="space-y-3">
                  <h4 className="text-base font-medium">💡 {t("profile.environmental.sustainabilityTips") || "Sustainability Tips"}</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-sm font-medium text-green-800">{t("profile.environmental.reduceFoodWaste") || "Reduce Food Waste"}</p>
                      <p className="text-xs text-green-600">
                        {t("profile.environmental.preventedWaste") || "You've prevented 2.1 kg CO₂ by using ingredients before expiration"}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm font-medium text-blue-800">{t("profile.environmental.mealPlanBenefits") || "Meal Planning Benefits"}</p>
                      <p className="text-xs text-blue-600">
                        {t("profile.environmental.wasteReduction") || "Your meal planning has reduced food waste by 78% this month"}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                      <p className="text-sm font-medium text-yellow-800">{t("profile.environmental.improvementOpportunity") || "Improvement Opportunity"}</p>
                      <p className="text-xs text-yellow-600">
                        {t("profile.environmental.checkExpiration") || "Check expiration dates more frequently to reduce waste by 15%"}
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Mobile Logout Button */}
      {isMobile && (
        <Card>
          <CardContent className="p-4">
            <Button
              variant="outline"
              onClick={logout}
              className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 flex items-center justify-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>{t('dashboard.header.logout')}</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Password Update Section */}
      <PasswordUpdate />

      {/* Cancel Subscription Modal */}
      <SubscriptionCancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        currentPlan={currentSubscriptionName}
        userId={authUser?.userId || ""}
      />
    </div>
  );
};

export default UserProfile;
