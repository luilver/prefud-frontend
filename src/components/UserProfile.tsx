
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Globe, MapPin, Edit2, Save, X, Languages } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import CountrySelect, { countries } from "./CountrySelect";
import { useLanguage } from "@/contexts/LanguageContext";
import PasswordUpdate from "./PasswordUpdate";

const UserProfile = () => {
  const { user, updateUserProfile } = useUser();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    country: user?.country || ""
  });

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
      country: user.country || ""
    });
    setIsEditing(false);
  };

  const getLanguageDisplay = (langCode?: string) => {
    switch (langCode) {
      case 'es':
        return { flag: '🇪🇸', name: t('language.spanish') };
      case 'pt':
        return { flag: '🇵🇹', name: t('language.portuguese') };
      default:
        return { flag: '🇺🇸', name: t('language.english') };
    }
  };

  const getCountryDisplay = (countryCode?: string) => {
    const country = countries.find(c => c.code === countryCode);
    return country ? { flag: country.flag, name: country.name, prefix: country.prefix } : null;
  };

  const languageDisplay = getLanguageDisplay(user.language);
  const countryDisplay = getCountryDisplay(user.country);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-600" />
              <CardTitle>{t('profile.title') || 'Profile Information'}</CardTitle>
            </div>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                {t('profile.edit') || 'Edit'}
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="border-gray-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  {t('common.cancel')}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t('common.save')}
                </Button>
              </div>
            )}
          </div>
          <CardDescription>
            {t('profile.description') || 'Manage your personal information and preferences'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('profile.personalInfo') || 'Personal Information'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('profile.fullName') || 'Full Name'}</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="border-green-200 focus:border-green-400"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{user.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('profile.email') || 'Email Address'}</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                    className="border-green-200 focus:border-green-400"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">{t('profile.country')}</Label>
                {isEditing ? (
                  <CountrySelect
                    value={editData.country}
                    onValueChange={(value) => setEditData(prev => ({ ...prev, country: value }))}
                    placeholder={t('profile.selectCountry') || 'Select country'}
                    className="border-green-200 focus:border-green-400"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    {countryDisplay ? (
                      <>
                        <span className="text-lg">{countryDisplay.flag}</span>
                        <span>{countryDisplay.name}</span>
                      </>
                    ) : (
                      <span className="text-gray-500">{t('profile.notSpecified') || 'Not specified'}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('profile.phone')}</Label>
                {isEditing ? (
                  <div className="flex space-x-2">
                    <div className="w-20">
                      <Input
                        value={countryDisplay?.prefix || ''}
                        disabled
                        className="border-green-200 bg-gray-50 text-center"
                      />
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      value={editData.phone.replace(countryDisplay?.prefix || '', '')}
                      onChange={(e) => setEditData(prev => ({ 
                        ...prev, 
                        phone: `${countryDisplay?.prefix || ''}${e.target.value}` 
                      }))}
                      className="border-green-200 focus:border-green-400 flex-1"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <Phone className="h-4 w-4 text-gray-500" />
                    {countryDisplay && (
                      <span className="text-lg">{countryDisplay.flag}</span>
                    )}
                    <span>{user.phone || (t('profile.notSpecified') || 'Not specified')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Language Preference */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('profile.languagePreference') || 'Language Preference'}</h3>
            <div className="space-y-2">
              <Label>{t('profile.language')}</Label>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                <Languages className="h-4 w-4 text-gray-500" />
                <span className="text-lg">{languageDisplay.flag}</span>
                <span>{languageDisplay.name}</span>
                <span className="text-sm text-gray-500 ml-auto">{t('profile.cannotChange') || '(Cannot be changed)'}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Subscription Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('profile.subscription') || 'Subscription'}</h3>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
              <Globe className="h-4 w-4 text-gray-500" />
              <span className="capitalize">{user.subscription.plan} {t('profile.plan') || 'Plan'}</span>
              {user.subscription.isSubscribed && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full ml-auto">
                  {t('profile.active') || 'Active'}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Update Section */}
      <PasswordUpdate />
    </div>
  );
};

export default UserProfile;
