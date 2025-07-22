
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUser } from '@/contexts/UserContext';
import { useLanguage, languages } from '@/contexts/LanguageContext';
import CountrySelect, { countries } from './CountrySelect';
import { User, Mail, Phone, Globe, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  countryCode: z.string().min(1, 'Please select a country'),
  preferredLanguage: z.string().min(1, 'Please select a language'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const UserProfile = () => {
  const { user, updateUserProfile } = useUser();
  const { t, setLanguage, currentLanguage } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      countryCode: user?.countryCode || '',
      preferredLanguage: user?.preferredLanguage || currentLanguage.code,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        countryCode: user.countryCode || '',
        preferredLanguage: user.preferredLanguage || currentLanguage.code,
      });
    }
  }, [user, form, currentLanguage.code]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Update language context if changed
      if (data.preferredLanguage !== currentLanguage.code) {
        const selectedLanguage = languages.find(lang => lang.code === data.preferredLanguage);
        if (selectedLanguage) {
          setLanguage(selectedLanguage);
        }
      }

      updateUserProfile(data);
      setIsEditing(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        countryCode: user.countryCode || '',
        preferredLanguage: user.preferredLanguage || currentLanguage.code,
      });
    }
    setIsEditing(false);
  };

  const selectedCountry = countries.find(c => c.code === form.watch('countryCode'));

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
          <User className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>{t('profile.personalInfo')}</span>
              </CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Language Selection */}
              <FormField
                control={form.control}
                name="preferredLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>{t('profile.language')}</span>
                    </FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!isEditing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language.code} value={language.code}>
                            {language.nativeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Full Name</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="email" {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Phone and Country */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        {isEditing ? (
                          <CountrySelect
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select country"
                          />
                        ) : (
                          <div className="flex items-center space-x-2 p-3 border rounded-md bg-gray-50">
                            <span className="text-lg">{selectedCountry?.flag}</span>
                            <span>{selectedCountry?.name}</span>
                            <span className="text-gray-500">({selectedCountry?.prefix})</span>
                          </div>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>Phone Number</span>
                      </FormLabel>
                      <div className="flex space-x-2">
                        <div className="w-20 flex items-center justify-center bg-gray-50 border rounded px-3 text-sm">
                          {selectedCountry?.prefix || '+1'}
                        </div>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isEditing && (
                <div className="flex space-x-4">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    {t('profile.save')}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    {t('profile.cancel')}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
