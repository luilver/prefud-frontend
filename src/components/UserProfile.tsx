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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { OrdersWidget } from "@/components/OrdersWidget";
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
  Home,
  Plus,
  Trash2,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAddresses, createUserAddress, deleteUserAddress, UserAddress, CreateAddressPayload } from "@/services/addressService";
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
import { getAuthHeaders } from "@/services/firebaseAuthService";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

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
import { useToast } from "@/hooks/use-toast";

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile, logout } = useUser();
  const { user: authUser, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
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

  // Address states
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<CreateAddressPayload>({
    country_code: 'US',
    zipcode: '',
    state: '',
    city: '',
    line1: '',
    line2: '',
    nickname: '',
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressSaveError, setAddressSaveError] = useState<string | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<UserAddress | null>(null);
  const [isDeletingAddress, setIsDeletingAddress] = useState(false);
  const [editPersonalData, setEditPersonalData] = useState({
    phone: "",
    phonePrefix: "+1",
    country: "",
  });

  const [editPreferencesData, setEditPreferencesData] = useState({
    language: "en",
    weight: 0,
    height: 0,
    healthGoals: {
      dailyCaloriesGoal: 2000,
      goals: [] as string[],
    },
    dietTypes: [] as string[],
    alergies: [] as string[],
  });

  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [consumptionHistory, setConsumptionHistory] = useState<ConsumptionData[]>([]);

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

  const handleToggleDiet = (label: string) => {
    setEditPreferencesData(prev => {
      const current = prev.dietTypes;
      if (current.includes(label)) {
        return { ...prev, dietTypes: current.filter(d => d !== label) };
      } else {
        return { ...prev, dietTypes: [...current, label] };
      }
    });
  };

  const handleToggleAllergy = (label: string) => {
    setEditPreferencesData(prev => {
      const current = prev.alergies;
      if (current.includes(label)) {
        return { ...prev, alergies: current.filter(a => a !== label) };
      } else {
        return { ...prev, alergies: [...current, label] };
      }
    });
  };

  const handleEditPersonal = () => {
    setEditPersonalData({
      phone: authUser?.profile?.phone || "",
      phonePrefix: authUser?.profile?.phonePrefix || "+1",
      country: authUser?.profile?.country || "",
    });
    setIsEditingPersonal(true);
  };

  const handleEditPreferences = () => {
    setEditPreferencesData({
      language: authUser?.profile?.languages || "en",
      weight: authUser?.profile?.weight || 0,
      height: authUser?.profile?.height || 0,
      healthGoals: {
        dailyCaloriesGoal: authUser?.profile?.healthGoals?.dailyCaloriesGoal || 2000,
        goals: authUser?.profile?.healthGoals?.goals || [],
      },
      dietTypes: authUser?.profile?.dietTypes || [],
      alergies: authUser?.profile?.alergies || [],
    });
    setIsEditingPreferences(true);
  };

  const handleSavePersonal = async () => {
    if (!authUser?.userId || !authUser?.token) return;
    setIsSaving(true);
    try {
      await authService.updateProfile(authUser.userId, authUser.token, {
        phone: editPersonalData.phone,
        phonePrefix: editPersonalData.phonePrefix,
        country: editPersonalData.country
      });
      await refreshProfile();
      setIsEditingPersonal(false);
      toast({ title: t("profile.personalInfo") + " updated successfully", variant: "default" });
    } catch (e) {
      toast({ title: "Error updating profile", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!authUser?.userId || !authUser?.token) return;
    setIsSaving(true);
    try {
      await authService.updateProfile(authUser.userId, authUser.token, {
        languages: editPreferencesData.language,
        weight: editPreferencesData.weight,
        height: editPreferencesData.height,
        healthGoals: editPreferencesData.healthGoals,
        dietTypes: editPreferencesData.dietTypes,
        alergies: editPreferencesData.alergies
      });
      await refreshProfile();
      setIsEditingPreferences(false);
      toast({ title: t("profile.preferences") + " updated successfully", variant: "default" });
    } catch (e) {
      toast({ title: "Error updating preferences", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!authUser?.userId) return;
    setAddressSaveError(null);
    setIsSavingAddress(true);
    try {
      await createUserAddress(authUser.userId, newAddress);
      const result = await getUserAddresses(authUser.userId);
      setAddresses(result);
      setShowNewAddressForm(false);
      setNewAddress({
        country_code: 'US',
        zipcode: '',
        state: '',
        city: '',
        line1: '',
        line2: '',
        nickname: '',
      });
      toast({ title: "Address added successfully", variant: "default" });
    } catch (error: any) {
      console.error('Error saving address:', error);
      setAddressSaveError(error.response?.data?.message || 'Failed to save address');
      toast({ title: "Failed to save address", variant: "destructive" });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete || !authUser?.userId) return;
    setIsDeletingAddress(true);
    try {
      await deleteUserAddress(authUser.userId, addressToDelete._id);
      const result = await getUserAddresses(authUser.userId);
      setAddresses(result);
      setAddressToDelete(null);
      toast({ title: "Address deleted successfully", variant: "default" });
    } catch (error: any) {
      console.error('Error deleting address:', error);
      toast({ title: "Failed to delete address", variant: "destructive" });
    } finally {
      setIsDeletingAddress(false);
    }
  };

  // Fetch subscription types, current subscription, and tracking data on component mount
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const headers = await getAuthHeaders();
        // Fetch subscription types
        const typesResponse = await axios.get(
          `${API_BASE_URL}/subscriptionType/all`,
          { headers }
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
          const headers = await getAuthHeaders();
          const response = await axios.get(
            `${API_BASE_URL}/meal-plan/trakking/${authUser.userId}?type=all`,
            { headers }
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
          const headers = await getAuthHeaders();
          const response = await axios.get(
            `${API_BASE_URL}/user-profile/${authUser.userId}/consumption?months=6`,
            { headers }
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
    const fetchAddresses = async () => {
      if (!authUser?.userId) return;
      setIsLoadingAddresses(true);
      try {
        const result = await getUserAddresses(authUser.userId);
        setAddresses(result);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchSubscriptionData();
    fetchTrackingData();
    fetchConsumptionData();
    fetchAddresses();
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
              </div>
                <div className="space-y-4 sm:space-y-6">
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("profile.description") ||
                      "Manage your personal information and preferences"}
                  </p>

                  {/* Personal Information */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="personal-info" className="border-b-0">
                      <AccordionTrigger className="hover:no-underline py-3 px-1 data-[state=open]:text-primary transition-colors">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary">
                            <User className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-lg">{t("profile.personalInfo") || "Personal Information"}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="flex justify-end mb-4">
                          {!isEditingPersonal ? (
                            <Button variant="outline" size="sm" onClick={handleEditPersonal} className="border-primary text-primary hover:bg-primary/5">
                              <Edit2 className="h-4 w-4 mr-2" />
                              {t("profile.edit") || "Edit"}
                            </Button>
                          ) : (
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => setIsEditingPersonal(false)} className="border-gray-300">
                                <X className="h-4 w-4 mr-2" />
                                {t("common.cancel") || "Cancel"}
                              </Button>
                              <Button size="sm" onClick={handleSavePersonal} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-white">
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? "..." : (t("common.save") || "Save")}
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm">
                          {t("profile.fullName") || "Full Name"}
                        </Label>
                        <div className="flex items-center space-x-2 p-2.5 sm:p-3 bg-gray-50 rounded-md">
                          <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm truncate">{user.name}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm">
                          {t("profile.email") || "Email Address"}
                        </Label>
                        <div className="flex items-center space-x-2 p-2.5 sm:p-3 bg-gray-50 rounded-md">
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm truncate">{user.email}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-sm">
                          {t("profile.country")}
                        </Label>
                        {isEditingPersonal ? (
                          <CountrySelect
                            value={editPersonalData.country}
                            onValueChange={(value) =>
                              setEditPersonalData((prev) => ({ ...prev, country: value }))
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
                        {isEditingPersonal ? (
                          <div className="flex space-x-2">
                            <div className="w-20 sm:w-24">
                              <Input
                                value={editPersonalData.phonePrefix}
                                onChange={(e) => setEditPersonalData(prev => ({ ...prev, phonePrefix: e.target.value }))}
                                placeholder="+1"
                                className="border-primary/20 text-center text-sm"
                              />
                            </div>
                            <Input
                              id="phone"
                              type="tel"
                              value={editPersonalData.phone}
                              onChange={(e) =>
                                setEditPersonalData((prev) => ({
                                  ...prev,
                                  phone: e.target.value,
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
                </AccordionContent>
              </AccordionItem>

              {/* Preferencias */}
              <AccordionItem value="preferences" className="border-none mt-2">
                <AccordionTrigger className="hover:no-underline py-3 px-1 data-[state=open]:text-primary transition-colors">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary">
                      <Heart className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-lg">{t("profile.preferences")}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex justify-end pt-4 px-1 mb-4">
                    {!isEditingPreferences ? (
                      <Button variant="outline" size="sm" onClick={handleEditPreferences} className="border-primary text-primary hover:bg-primary/5">
                        <Edit2 className="h-4 w-4 mr-2" />
                        {t("profile.edit") || "Edit"}
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setIsEditingPreferences(false)} className="border-gray-300">
                          <X className="h-4 w-4 mr-2" />
                          {t("common.cancel") || "Cancel"}
                        </Button>
                        <Button size="sm" onClick={handleSavePreferences} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-white">
                          <Save className="h-4 w-4 mr-2" />
                          {isSaving ? "..." : (t("common.save") || "Save")}
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4 pb-2 px-1">
                    
                    {/* Dieta */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-500">{t("signup.dietaryPreferences") || "Dietary Preferences"}</Label>
                      <div className="flex flex-wrap gap-2">
                        {isEditingPreferences ? (
                          dietTypesOptions.map((diet) => {
                            const isSelected = editPreferencesData.dietTypes.includes(diet.label);
                            return (
                              <button
                                key={diet.id}
                                onClick={() => handleToggleDiet(diet.label)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                  isSelected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {diet.label}
                              </button>
                            );
                          })
                        ) : (
                          authUser?.profile?.dietTypes && authUser.profile.dietTypes.length > 0 ? (
                            authUser.profile.dietTypes.map((diet, index) => (
                              <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                {diet}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">{t("profile.notSpecified") || "Not specified"}</span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Alergias */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-500">{t("signup.allergiesRestrictions") || "Allergies & Restrictions"}</Label>
                      <div className="flex flex-wrap gap-2">
                        {isEditingPreferences ? (
                          allergiesOptions.map((allergy) => {
                            const isSelected = editPreferencesData.alergies.includes(allergy.label);
                            return (
                              <button
                                key={allergy.id}
                                onClick={() => handleToggleAllergy(allergy.label)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                  isSelected ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {allergy.label}
                              </button>
                            );
                          })
                        ) : (
                          authUser?.profile?.alergies && authUser.profile.alergies.length > 0 ? (
                            authUser.profile.alergies.map((allergy, index) => (
                              <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                {allergy}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">{t("profile.notSpecified") || "Not specified"}</span>
                          )
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Peso */}
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-500">{t("signup.weight") || "Weight"}</Label>
                        {isEditingPreferences ? (
                          <div className="flex items-center space-x-2">
                            <Activity className="h-4 w-4 text-gray-400" />
                            <Input
                              type="number"
                              value={editPreferencesData.weight || ""}
                              onChange={(e) => setEditPreferencesData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                              className="border-primary/20 focus:border-primary/40 text-sm"
                            />
                            <span className="text-sm text-gray-500">lbs</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                            <Activity className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">
                              {authUser?.profile?.weight ? `${authUser.profile.weight} lbs` : (t("profile.notSpecified") || "Not specified")}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Estatura */}
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-500">{t("signup.physicalInfo") || "Physical Info"}</Label>
                        {isEditingPreferences ? (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <Input
                              type="number"
                              step="0.01"
                              value={editPreferencesData.height || ""}
                              onChange={(e) => setEditPreferencesData(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                              className="border-primary/20 focus:border-primary/40 text-sm"
                            />
                            <span className="text-sm text-gray-500">m</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">
                              {authUser?.profile?.height ? `${authUser.profile.height} m` : (t("profile.notSpecified") || "Not specified")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metas de Salud (Calorías) */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-500">{t("signup.dailyCaloriesGoal") || "Daily Calories Goal"}</Label>
                      {isEditingPreferences ? (
                        <div className="flex items-center space-x-2">
                          <Flame className="h-4 w-4 text-orange-400" />
                          <Input
                            type="number"
                            value={editPreferencesData.healthGoals.dailyCaloriesGoal || ""}
                            onChange={(e) => setEditPreferencesData(prev => ({ 
                              ...prev, 
                              healthGoals: { ...prev.healthGoals, dailyCaloriesGoal: parseInt(e.target.value) || 0 }
                            }))}
                            className="border-primary/20 focus:border-primary/40 text-sm"
                          />
                          <span className="text-sm text-gray-500">kcal</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                          <Flame className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">
                            {authUser?.profile?.healthGoals?.dailyCaloriesGoal ? `${authUser.profile.healthGoals.dailyCaloriesGoal} kcal` : (t("profile.notSpecified") || "Not specified")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Idioma */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-500">{t("profile.languagePreference") || "Language Preference"}</Label>
                      {isEditingPreferences ? (
                        <Select
                          value={editPreferencesData.language}
                          onValueChange={(value) => setEditPreferencesData(prev => ({ ...prev, language: value }))}
                        >
                          <SelectTrigger className="w-full border-primary/20 focus:ring-primary/40 text-sm">
                            <SelectValue placeholder={t("language.english") || "English"} />
                          </SelectTrigger>
                          <SelectContent>
                            {languageOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center space-x-2">
                                  <span>{option.flag}</span>
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                          <Languages className="h-4 w-4 text-gray-500" />
                          <span className="text-lg">
                            {languageDisplay.flag}
                          </span>
                          <span className="text-sm font-medium flex-1">
                            {languageDisplay.name}
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Addresses */}
              <AccordionItem value="addresses" className="border-b-0 mt-2">
                <AccordionTrigger className="hover:no-underline py-3 px-1 data-[state=open]:text-primary transition-colors">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-lg">{t("checkout.address.delivery.title") || "Addresses"}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  {isLoadingAddresses ? (
                    <div className="flex justify-center p-4"><span className="text-sm text-gray-500">Loading...</span></div>
                  ) : showNewAddressForm ? (
                    <div className="space-y-4 px-1">
                      <h3 className="font-medium">{t("checkout.address.addNew") || "Add New Address"}</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="nickname" className="text-xs">Nickname (optional)</Label>
                          <Input id="nickname" value={newAddress.nickname} onChange={e => setNewAddress(prev => ({...prev, nickname: e.target.value}))} placeholder="Home, Work..." />
                        </div>
                        <div>
                          <Label htmlFor="line1" className="text-xs">{t("checkout.address.form.street") || "Street Address"}</Label>
                          <Input id="line1" value={newAddress.line1} onChange={e => setNewAddress(prev => ({...prev, line1: e.target.value}))} placeholder="123 Main St" />
                        </div>
                        <div>
                          <Label htmlFor="line2" className="text-xs">Apt/Suite (optional)</Label>
                          <Input id="line2" value={newAddress.line2} onChange={e => setNewAddress(prev => ({...prev, line2: e.target.value}))} placeholder="Apt 4B" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="city" className="text-xs">{t("checkout.address.form.city") || "City"}</Label>
                            <Input id="city" value={newAddress.city} onChange={e => setNewAddress(prev => ({...prev, city: e.target.value}))} placeholder="City" />
                          </div>
                          <div>
                            <Label htmlFor="state" className="text-xs">{t("checkout.address.form.state") || "State"}</Label>
                            <Input id="state" value={newAddress.state} onChange={e => setNewAddress(prev => ({...prev, state: e.target.value}))} placeholder="State" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="zipcode" className="text-xs">{t("checkout.address.form.zipCode") || "Zip Code"}</Label>
                            <Input id="zipcode" value={newAddress.zipcode} onChange={e => setNewAddress(prev => ({...prev, zipcode: e.target.value}))} placeholder="12345" />
                          </div>
                          <div>
                            <Label htmlFor="country_code" className="text-xs">{t("checkout.address.form.country") || "Country Code"}</Label>
                            <Input id="country_code" value={newAddress.country_code} onChange={e => setNewAddress(prev => ({...prev, country_code: e.target.value.toUpperCase()}))} placeholder="US" maxLength={2} />
                          </div>
                        </div>
                      </div>
                      {addressSaveError && <p className="text-xs text-destructive">{addressSaveError}</p>}
                      <div className="flex space-x-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => setShowNewAddressForm(false)} className="w-full">
                          {t("common.cancel") || "Cancel"}
                        </Button>
                        <Button size="sm" onClick={handleSaveAddress} disabled={isSavingAddress} className="w-full bg-primary text-white">
                          {isSavingAddress ? "..." : (t("common.save") || "Save")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 px-1">
                      {addresses.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No addresses found.</p>
                      ) : (
                        <div className="space-y-3">
                          {addresses.map((addr) => (
                            <div key={addr._id} className="p-3 bg-gray-50 rounded-md flex items-start space-x-3">
                              <Home className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="text-sm font-medium">{addr.nickname || addr.line1}</h4>
                                <p className="text-xs text-gray-500">{addr.line1} {addr.line2}</p>
                                <p className="text-xs text-gray-500">{addr.city}, {addr.state} {addr.zipcode}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                onClick={() => setAddressToDelete(addr)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button variant="outline" size="sm" className="w-full text-primary border-primary" onClick={() => setShowNewAddressForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("checkout.address.addNew") || "Add New Address"}
                      </Button>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
          </div>
          </CardContent>
        </Card>

        {/* Orders Section */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden max-w-full">
          <CardContent className="p-6">
            <Button 
              className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setShowOrders(true)}
            >
              {t("orders.title") || "Orders"}
            </Button>
          </CardContent>
        </Card>

        <Dialog open={showOrders} onOpenChange={setShowOrders}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>{t("orders.title") || "Orders"}</DialogTitle>
            </DialogHeader>
            <div className="py-4 min-w-0 max-w-full overflow-hidden">
              <OrdersWidget />
            </div>
          </DialogContent>
        </Dialog>


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
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl mt-4">
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

        {/* Logout Button */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl mt-4 md:hidden">
          <CardContent className="p-4">
            <Button
              onClick={logout}
              variant="destructive"
              className="w-full transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
            >
              <LogOut className="h-4 w-4" />
              <span>{t("dashboard.header.logout") || "Logout"}</span>
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

        {/* Delete Address Modal */}
        <Dialog open={!!addressToDelete} onOpenChange={(open) => !open && setAddressToDelete(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Address</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this address? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setAddressToDelete(null)} disabled={isDeletingAddress}>
                {t("common.cancel") || "Cancel"}
              </Button>
              <Button variant="destructive" onClick={handleDeleteAddress} disabled={isDeletingAddress} className="bg-red-600 text-white hover:bg-red-700">
                {isDeletingAddress ? "..." : (t("common.delete") || "Delete")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
