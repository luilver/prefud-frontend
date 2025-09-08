import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import CountrySelect, { countries } from "./CountrySelect";
import { useLanguage } from "@/contexts/LanguageContext";
import PasswordUpdate from "./PasswordUpdate";
import SubscriptionCancelModal from "./SubscriptionCancelModal";
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

const UserProfile = () => {
  const { user, updateUserProfile } = useUser();
  const { user: authUser } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [subscriptionTypes, setSubscriptionTypes] = useState<
    SubscriptionType[]
  >([]);
  const [currentSubscriptionName, setCurrentSubscriptionName] =
    useState<string>("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    country: user?.country || "",
  });

  // Fetch subscription types on component mount
  useEffect(() => {
    const fetchSubscriptionTypes = async () => {
      try {
        const response = await axios.get(
          "https://pantry-auth-1.onrender.com/subscriptionType/all"
        );
        setSubscriptionTypes(response.data);
      } catch (error) {
        console.error("Error fetching subscription types:", error);
      }
    };

    fetchSubscriptionTypes();
  }, []);

  // Find current subscription name based on subscriptionTypeId
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
      } else {
        // User has no subscription ID, they're on Free plan
        setCurrentSubscriptionName("Free");
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
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              <CardTitle className="text-lg sm:text-xl">
                {t("profile.title") || "Profile Information"}
              </CardTitle>
            </div>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="border-green-500 text-green-600 hover:bg-green-50 w-full sm:w-auto"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                {t("profile.edit") || "Edit"}
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
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
          </div>
          <CardDescription className="text-sm">
            {t("profile.description") ||
              "Manage your personal information and preferences"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
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
                          {authUser.profile.country
}
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

          <Separator />
        </CardContent>
      </Card>

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
