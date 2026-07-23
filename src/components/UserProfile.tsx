import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { isNativePlatform } from "@/services/revenueCatService";
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
  Heart,
  Camera,
  Palette,
  Settings as SettingsIcon,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import CountrySelect, { countries } from "./CountrySelect";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme, THEMES, ThemeId } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";
import PasswordUpdate from "./PasswordUpdate";
import SubscriptionCancelModal from "./SubscriptionCancelModal";
import SubscriptionManager from "./SubscriptionManager";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DeleteAccountModal from "./DeleteAccountModal";
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
  processImages?: number;
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
  processImages?: number;
  _id: string;
}

interface CalorieTrack {
  _id: string;
  year: string;
  month: string;
  user_id: string;
  caloriesConsumed: number;
  createdAt: string;
  updatedAt: string;
}

interface CarbonTrack {
  _id: string;
  year: string;
  month: string;
  user_id: string;
  carbonConsumed: number;
  createdAt: string;
  updatedAt: string;
}

interface HealthGoals {
  dailyCaloriesGoal: number;
  goals: string[];
  _id: string;
}


interface ConsumptionData {
  monthName: string;
  year: string;
  carbonConsumed: number;
  caloriesConsumed: number;
}

interface TrackingData {
  caloriesTrak: CalorieTrack | null;
  carbonTrak: CarbonTrack | null;
  healthGoals: HealthGoals | null;
}
const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://pantry-ms-brain.onrender.com';

const UserProfile = () => {
  const navigate = useNavigate();
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
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    country: user?.country || "",
  });
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [consumptionHistory, setConsumptionHistory] = useState<ConsumptionData[]>([]);

  // Fetch subscription types, current subscription, and tracking data on component mount
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        // Fetch subscription types
        const typesResponse = await axios.get(
          `${API_BASE_URL}/subscriptionType/all`
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

    const fetchTrackingData = async () => {
      try {
        if (authUser?.userId) {
          const response = await axios.get(
            `${API_BASE_URL}/meal-plan/trakking/${authUser.userId}?type=all`
          );
          setTrackingData(response.data);
        }
      } catch (error) {
        console.error("Error fetching tracking data:", error);
      }
    };


    const fetchConsumptionData = async () => {
      try {
        if (authUser?.userId) {
          const response = await axios.get(
            `${API_BASE_URL}/user-profile/${authUser.userId}/consumption?months=6`
          );
          
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const formattedData = response.data.map((item: any) => ({
            monthName: monthNames[parseInt(item.month) - 1] || item.month,
            year: item.year,
            carbonConsumed: item.carbonConsumed || 0,
            caloriesConsumed: item.caloriesConsumed || 0
          })).reverse(); // Reverse so it goes oldest to newest
          
          setConsumptionHistory(formattedData);
        }
      } catch (error) {
        console.error("Error fetching consumption history:", error);
      }
    };

    fetchSubscriptionData();
    fetchTrackingData();
    fetchConsumptionData();
  }, [authUser?.userId]);

  // Calculate daily average for calories
  const getDaysInCurrentMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  };

  const caloriesConsumed = trackingData?.caloriesTrak?.caloriesConsumed ?? 0;
  const dailyCaloriesAverage = caloriesConsumed > 0 
    ? Math.round(caloriesConsumed / getDaysInCurrentMonth()) 
    : 0;
  const carbonConsumed = trackingData?.carbonTrak?.carbonConsumed ?? 0;
  const dailyCaloriesGoal = trackingData?.healthGoals?.dailyCaloriesGoal ?? authUser?.profile?.healthGoals?.dailyCaloriesGoal ?? 2000;
  const healthGoals = trackingData?.healthGoals?.goals ?? [];

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
    setCurrentSubscriptionName("Free");
    setShowCancelModal(false);
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      // TODO: Call actual delete account API
      // await authService.deleteAccount(authUser?.userId);
      logout();
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteAccountModal(false);
    }
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
    <div className="min-h-screen relative">
      {/* Beautiful Profile Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/70 to-accent/80" />
      </div>

      <div className="relative z-10 space-y-4 sm:space-y-6 max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-primary/40 backdrop-blur-sm rounded-xl p-3 sm:p-6 border border-primary/20 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">
                {t("profile.title") || "My Profile"}
              </h1>
              <p className="text-xs sm:text-sm text-primary-foreground/80 mt-0.5">
                {t("profile.description") || "Manage your personal information and preferences"}
              </p>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Configuration
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Configuration</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <SettingsSection />
                <PasswordUpdate />
                <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-red-600">
                        {t("profile.deleteAccount.section") || "Danger Zone"}
                      </h3>
                      <p className="text-xs text-red-500 mt-0.5">
                        {t("profile.deleteAccount.sectionDesc") || "Permanently delete your account and all data"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteAccountModal(true)}
                      className="text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 bg-white"
                    >
                      {t("profile.deleteAccount.button") || "Delete Account"}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Profile Information */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="text-lg sm:text-xl font-semibold">
                  {t("profile.personalInfo") || "Profile Information"}
                </span>
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  {t("profile.edit") || "Edit"}
                </Button>
              )}
            </div>
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
                        className="bg-primary hover:bg-primary w-full sm:w-auto"
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
                            className="border-primary/20 focus:border-primary/40 text-sm"
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
                            className="border-primary/20 focus:border-primary/40 text-sm"
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
                            className="border-primary/20 focus:border-primary/40 text-sm"
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
                                className="border-primary/20 bg-gray-50 text-center text-sm"
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
                              className="border-primary/20 focus:border-primary/40 flex-1 text-sm"
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
        </CardContent>
      </Card>


      {/* Tabs Section for tracking and subscription */}
            <Tabs defaultValue="calories" className="w-full space-y-4">
<TabsList className="w-full grid grid-cols-3 bg-white/95 shadow-md h-12">
          <TabsTrigger value="calories" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-full">
            <Flame className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Calories</span>
          </TabsTrigger>
          <TabsTrigger value="environmental" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-full">
            <Leaf className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Impact</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-full">
            <Trophy className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Subscription</span>
          </TabsTrigger>
        </TabsList>
          <TabsContent value="calories">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Flame className="h-5 w-5 text-orange-600" />
                <h3 className="text-xl font-semibold">
                  {t("profile.calorieTracking.title") || "Calorie Tracking"}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                  {t("profile.calorieTracking.description") || "Track your monthly calorie consumption and goals"}
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Daily Goal */}
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      <span className="text-2xl font-bold text-orange-600">
                        {dailyCaloriesGoal.toLocaleString()}
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
                        {caloriesConsumed.toLocaleString()}
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
                        {dailyCaloriesAverage.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{t("profile.calorieTracking.dailyAverage") || "Daily Average"}</p>
                    <p className="text-xs text-gray-500">{t("profile.calorieTracking.thisMonth") || "This month"}</p>
                  </div>
                </div>


                <div className="mt-6">
                  <h4 className="text-base font-medium mb-3">{t("profile.calorieTracking.history") || "6-Month Calorie History"}</h4>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={consumptionHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="monthName" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                        <Tooltip 
                          cursor={{ fill: '#f9f9f9' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="caloriesConsumed" name="Calories" fill="#ea580c" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-base font-medium mb-3">{t("profile.calorieTracking.healthGoalsProgress") || "Health Goals Progress"}</h4>
                  <div className="space-y-2">
                    {healthGoals.length > 0 ? (
                      healthGoals.map((goal, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">{goal}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            </div>
                            <span className="text-xs text-primary">Active</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <span className="text-sm text-gray-500">{t("profile.calorieTracking.noGoals") || "No health goals set"}</span>
                      </div>
                    )}
                  </div>
                </div>
            </CardContent>
          </Card>
          </TabsContent>
          <TabsContent value="environmental">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Leaf className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">
                  {t("profile.environmental.title") || "Environmental Impact"}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                  {t("profile.environmental.description") || "Track your monthly carbon emissions from ingredients and meals"}
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  {/* Consumed Meals Impact */}
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <Utensils className="h-5 w-5 text-primary" />
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary">{carbonConsumed.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 ml-1">kg CO₂</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{t("profile.environmental.consumedMeals") || "Consumed Meals"}</p>
                    <p className="text-xs text-gray-500">{t("profile.environmental.carbonUsed") || "Carbon footprint used"}</p>
                  </div>

                  {/* Total Monthly Impact */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <Leaf className="h-6 w-6 text-blue-600" />
                      <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600">{carbonConsumed.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 ml-1">kg CO₂</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{t("profile.environmental.totalMonthly") || "Total Monthly Impact"}</p>
                    <p className="text-xs text-gray-500">{t("profile.environmental.combinedFootprint") || "Combined carbon footprint"}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-base font-medium mb-3">{t("profile.environmental.history") || "6-Month Carbon Footprint History"}</h4>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={consumptionHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="monthName" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line type="monotone" dataKey="carbonConsumed" name="Carbon (kg CO₂)" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {/* Environmental Tips */}
                <div className="space-y-3">
                  <h4 className="text-base font-medium">💡 {t("profile.environmental.sustainabilityTips") || "Sustainability Tips"}</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-sm font-medium text-primary">{t("profile.environmental.reduceFoodWaste") || "Reduce Food Waste"}</p>
                        <p className="text-xs text-primary">
                          {t("profile.environmental.preventedWaste") || "You've prevented 2.1 kg CO₂ by using ingredients before expiration"}
                        </p>
                      </div>
                      <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
                        <p className="text-sm font-medium text-primary">{t("profile.environmental.mealPlanBenefits") || "Meal Planning Benefits"}</p>
                        <p className="text-xs text-primary">
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

                
            </CardContent>
          </Card>
          </TabsContent>
          <TabsContent value="subscription">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">
                    {t("profile.subscription") || "My Subscription"}
                  </h3>
                  <div className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {currentSubscriptionName} Plan
                  </div>
                </div>
                <div className="flex space-x-2">
                  {hasActiveSubscription ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCancelModal(true)}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hidden sm:flex"
                    >
                      Cancel Subscription
                    </Button>
                  ) : null}
                </div>
              </div>
              
              <div className="mt-6">
                <SubscriptionManager />
              </div>
            </CardContent>
          </Card>
          </TabsContent>
        </Tabs>

        {/* Check Favorites Button */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4">
            <Button
              onClick={() => navigate("/favorites")}
              className="w-full bg-gradient-to-r from-primary to-accent text-white hover:from-primary hover:to-accent transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
            >
              <Heart className="h-4 w-4" />
              <span>{t("profile.checkFavorites")}</span>
            </Button>
          </CardContent>
        </Card>

        {/* Cancel Subscription Modal */}
        <SubscriptionCancelModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelSubscription}
          currentPlan={currentSubscriptionName}
          userId={authUser?.userId || ""}
        />

        {/* Delete Account Modal */}
        <DeleteAccountModal
          isOpen={showDeleteAccountModal}
          onClose={() => setShowDeleteAccountModal(false)}
          onConfirm={handleDeleteAccount}
          isProcessing={isDeletingAccount}
        />
      </div>
    </div>
  );
};

export default UserProfile;

const SettingsSection = () => {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardContent className="p-0">
        <Accordion type="single" collapsible defaultValue="settings">
          <AccordionItem value="settings" className="border-none">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center space-x-2">
                <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="text-lg sm:text-xl font-semibold">
                  {t("settings.title") || "Settings"}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-medium">
                    {t("settings.theme.title") || "App Theme"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("settings.theme.description") ||
                      "Choose a color palette and matching logo for the app"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.values(THEMES) as Array<typeof THEMES[ThemeId]>).map((tm) => {
                    const active = theme === tm.id;
                    return (
                      <button
                        key={tm.id}
                        type="button"
                        onClick={() => {
                          setTheme(tm.id);
                          setTimeout(() => window.location.reload(), 150);
                        }}
                        className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all bg-white ${
                          active
                            ? "border-primary shadow-lg scale-[1.02]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        aria-pressed={active}
                      >
                        <img
                          src={tm.logoUrl}
                          alt={tm.id}
                          className="h-16 w-auto object-contain"
                        />
                        <div className="flex items-center gap-1.5">
                          {tm.swatches.map((c) => (
                            <span
                              key={c}
                              className="h-4 w-4 rounded-full border border-black/10"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-center text-gray-700">
                          {t(tm.labelKey) || tm.id}
                        </span>
                        {active && (
                          <span className="absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
