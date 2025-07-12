import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Target, 
  Crown, 
  Bell, 
  CreditCard, 
  History, 
  Download, 
  Plus, 
  Trash2, 
  Star,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import SubscriptionPurchase from "./SubscriptionPurchase";

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  phonePrefix: string;
  age: number;
  weight: number;
  heightFeet: number;
  heightInches: number;
  activity_level: string;
  dietary_preferences: string[];
  allergies: string[];
  daily_calorie_goal: number;
  meals_per_day: number;
  people_count: number;
}

const UserProfile = () => {
  const { 
    user, 
    updateUserProfile, 
    subscriptionInfo, 
    checkSubscription,
    billingHistory,
    paymentMethods,
    getBillingHistory,
    getPaymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    cancelSubscription
  } = useUser();
  const { toast } = useToast();
  const [showSubscriptionPurchase, setShowSubscriptionPurchase] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const form = useForm<UserFormData>({
    defaultValues: {
      name: user?.name || "John Doe",
      email: user?.email || "john.doe@example.com",
      phone: user?.phone?.replace(/^\+1/, "") || "2345678901",
      phonePrefix: "+1",
      age: 32,
      weight: 175,
      heightFeet: 5,
      heightInches: 10,
      activity_level: "moderate",
      dietary_preferences: ["Balanced", "High Protein"],
      allergies: ["Nuts"],
      daily_calorie_goal: 2000,
      meals_per_day: 3,
      people_count: 2
    }
  });

  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>(["Balanced", "High Protein"]);

  useEffect(() => {
    if (user) {
      form.setValue('name', user.name);
      form.setValue('email', user.email);
      const phoneNumber = user.phone?.replace(/^\+1/, "") || "";
      form.setValue('phone', phoneNumber);
      // Check subscription status on load
      checkSubscription();
      
      // Load billing data if subscribed
      if (user.subscription?.isSubscribed) {
        getBillingHistory();
        getPaymentMethods();
      }
    }
  }, [user, form, checkSubscription, getBillingHistory, getPaymentMethods]);

  const onSubmit = (data: UserFormData) => {
    const fullPhone = `${data.phonePrefix}${data.phone}`;
    updateUserProfile({
      name: data.name,
      email: data.email,
      phone: fullPhone,
    });
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const calculateBMI = () => {
    const weight = form.watch('weight');
    const heightFeet = form.watch('heightFeet');
    const heightInches = form.watch('heightInches');
    const totalInches = (heightFeet * 12) + heightInches;
    const heightInMeters = (totalInches * 2.54) / 100;
    const weightInKg = weight * 0.453592;
    return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-600" };
    if (bmi < 25) return { category: "Normal", color: "text-green-600" };
    if (bmi < 30) return { category: "Overweight", color: "text-orange-600" };
    return { category: "Obese", color: "text-red-600" };
  };

  const handleDietaryPrefToggle = (diet: string) => {
    const currentPrefs = dietaryPrefs;
    const newPrefs = currentPrefs.includes(diet)
      ? currentPrefs.filter(p => p !== diet)
      : [...currentPrefs, diet];
    setDietaryPrefs(newPrefs);
    form.setValue('dietary_preferences', newPrefs);
  };

  const handleManageSubscription = () => {
    if (subscriptionInfo?.subscribed) {
      setActiveTab("billing");
    } else {
      // For non-subscribers, show subscription purchase
      setShowSubscriptionPurchase(true);
    }
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await addPaymentMethod(newCard);
      setShowAddCard(false);
      setNewCard({ cardNumber: '', expiryDate: '', cvv: '', cardName: '' });
      await getPaymentMethods();
      toast({
        title: "Payment Method Added",
        description: "Your payment method has been added successfully.",
      });
    } catch (error) {
      console.error('Failed to add payment method:', error);
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    setIsLoading(true);
    try {
      await deletePaymentMethod(methodId);
      await getPaymentMethods();
      toast({
        title: "Payment Method Removed",
        description: "Your payment method has been removed successfully.",
      });
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      toast({
        title: "Error",
        description: "Failed to remove payment method. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      await cancelSubscription();
      await checkSubscription();
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled and will end at the current billing period.",
      });
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const bmi = parseFloat(calculateBMI());
  const bmiInfo = getBMICategory(bmi);

  if (showSubscriptionPurchase) {
    return (
      <SubscriptionPurchase
        onBack={() => setShowSubscriptionPurchase(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Personal Information Form */}
            <Card className="lg:col-span-2 bg-white/70 backdrop-blur-sm border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-green-600" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>
                  Update your basic information and physical stats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="border-green-200 focus:border-green-400" />
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} className="border-green-200 focus:border-green-400" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormItem className="md:col-span-2">
                        <FormLabel>Phone Number</FormLabel>
                        <div className="flex space-x-2">
                          <FormField
                            control={form.control}
                            name="phonePrefix"
                            render={({ field }) => (
                              <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger className="w-24 border-green-200 focus:border-green-400">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="+1">🇺🇸 +1</SelectItem>
                                    <SelectItem value="+44">🇬🇧 +44</SelectItem>
                                    <SelectItem value="+33">🇫🇷 +33</SelectItem>
                                    <SelectItem value="+49">🇩🇪 +49</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="flex-1 border-green-200 focus:border-green-400"
                                  placeholder="Enter phone number"
                                />
                              </FormControl>
                            )}
                          />
                        </div>
                      </FormItem>
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(parseInt(e.target.value))}
                                className="border-green-200 focus:border-green-400" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Physical Stats */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Physical Stats & Health Goals</h3>
                      <div className="grid md:grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weight (lbs)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={e => field.onChange(parseFloat(e.target.value))}
                                  className="border-green-200 focus:border-green-400" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="heightFeet"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Height (feet)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="8"
                                  {...field} 
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                  className="border-green-200 focus:border-green-400" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="heightInches"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Height (inches)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  max="11"
                                  {...field} 
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                  className="border-green-200 focus:border-green-400" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div>
                          <Label>BMI</Label>
                          <div className="p-2 border border-gray-200 rounded-md bg-gray-50">
                            <span className="font-medium">{calculateBMI()}</span>
                            <span className={`ml-2 text-sm ${bmiInfo.color}`}>
                              ({bmiInfo.category})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Health Goals */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Goals</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="daily_calorie_goal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Daily Calorie Goal</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                  className="border-green-200 focus:border-green-400" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="meals_per_day"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meals per Day</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="6" 
                                  {...field} 
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                  className="border-green-200 focus:border-green-400" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="people_count"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>People Count</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  {...field} 
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                  className="border-green-200 focus:border-green-400" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Dietary Preferences */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Dietary Preferences</h3>
                      <div className="space-y-4">
                        <div>
                          <Label>Diet Types</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {['Balanced', 'High Protein', 'Low Carb', 'Vegetarian', 'Vegan', 'Keto', 'Mediterranean'].map((diet) => (
                              <button
                                key={diet}
                                type="button"
                                onClick={() => handleDietaryPrefToggle(diet)}
                                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                                  dietaryPrefs.includes(diet)
                                    ? 'bg-green-500 text-white border-green-500'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                                }`}
                              >
                                {diet}
                              </button>
                            ))}
                          </div>
                        </div>
                        <FormField
                          control={form.control}
                          name="allergies"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Allergies & Restrictions</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="List any food allergies or restrictions..."
                                  value={field.value.join(', ')}
                                  onChange={(e) => field.onChange(e.target.value.split(', ').filter(a => a.trim()))}
                                  className="border-green-200 focus:border-green-400"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
                    >
                      Save Changes
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Right sidebar with subscription and health stats */}
            <div className="space-y-6">
              <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-700">
                    <Target className="h-5 w-5" />
                    <span>Health Goals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800">Current BMI</h4>
                      <p className="text-2xl font-bold text-blue-700">{calculateBMI()}</p>
                      <p className={`text-sm ${bmiInfo.color}`}>{bmiInfo.category}</p>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800">Daily Calories</h4>
                      <p className="text-2xl font-bold text-green-700">{form.watch('daily_calorie_goal')}</p>
                      <p className="text-sm text-green-600">Target intake</p>
                    </div>

                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-medium text-orange-800">Meal Planning</h4>
                      <p className="text-2xl font-bold text-orange-700">{form.watch('meals_per_day')}</p>
                      <p className="text-sm text-orange-600">Meals per day</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-orange-700">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Meal reminders</span>
                      <div className="w-10 h-6 bg-green-500 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Expiration alerts</span>
                      <div className="w-10 h-6 bg-green-500 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Shopping reminders</span>
                      <div className="w-10 h-6 bg-gray-300 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          {/* Subscription Status */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-700">
                <Crown className="h-5 w-5" />
                <span>Current Subscription</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-purple-800">
                      {user?.subscription?.plan === 'family' ? 'Family' : user?.subscription?.plan === 'professional' ? 'Professional' : subscriptionInfo?.subscription_tier || 'Free'} Plan
                    </p>
                    <p className="text-sm text-purple-600">
                      {user?.subscription?.isSubscribed || subscriptionInfo?.subscribed ? 'Active' : 'Inactive'}
                    </p>
                    {(user?.subscription?.nextBilling || subscriptionInfo?.subscription_end) && (
                      <p className="text-xs text-purple-500">
                        {user?.subscription?.isSubscribed || subscriptionInfo?.subscribed ? 'Renews' : 'Expires'}: {
                          new Date(user?.subscription?.nextBilling || subscriptionInfo?.subscription_end || '').toLocaleDateString()
                        }
                      </p>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    user?.subscription?.isSubscribed || subscriptionInfo?.subscribed
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {user?.subscription?.isSubscribed || subscriptionInfo?.subscribed ? 'Active' : 'Free'}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-purple-700">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${user?.subscription?.isSubscribed || subscriptionInfo?.subscribed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>AI Meal Recommendations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${user?.subscription?.isSubscribed || subscriptionInfo?.subscribed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Grocery Store Integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${user?.subscription?.isSubscribed || subscriptionInfo?.subscribed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Unlimited Meal Plans</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${user?.subscription?.isSubscribed || subscriptionInfo?.subscribed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Recipe Videos</span>
                  </div>
                </div>

                <Button 
                  onClick={handleManageSubscription}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {user?.subscription?.isSubscribed || subscriptionInfo?.subscribed ? 'Manage Subscription' : 'Get Premium'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage This Month */}
          {user?.subscription?.isSubscribed && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usage This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Plans Used:</span>
                    <span className="font-medium">
                      {user.subscription.planLimits.usedPlans}/{user.subscription.planLimits.plansPerMonth}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(user.subscription.planLimits.usedPlans / user.subscription.planLimits.plansPerMonth) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cancel Subscription */}
          {(user?.subscription?.isSubscribed || subscriptionInfo?.subscribed) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span>Cancel Subscription</span>
                </CardTitle>
                <CardDescription>
                  Cancel your subscription. You'll continue to have access until the end of your billing period.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user?.subscription?.cancelAtPeriodEnd ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                      Your subscription is set to cancel at the end of the current billing period.
                    </p>
                  </div>
                ) : (
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelSubscription}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Cancel Subscription'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span>Payment Methods</span>
                </CardTitle>
                <Button onClick={() => setShowAddCard(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddCard && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                      <div>
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          value={newCard.cardName}
                          onChange={(e) => setNewCard({...newCard, cardName: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          value={newCard.cardNumber}
                          onChange={(e) => setNewCard({...newCard, cardNumber: formatCardNumber(e.target.value)})}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            value={newCard.expiryDate}
                            onChange={(e) => setNewCard({...newCard, expiryDate: formatExpiryDate(e.target.value)})}
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            type="password"
                            value={newCard.cvv}
                            onChange={(e) => setNewCard({...newCard, cvv: e.target.value.replace(/\D/g, '').substring(0, 4)})}
                            placeholder="123"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? 'Adding...' : 'Add Payment Method'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowAddCard(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <Card key={method.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-8 w-8 text-gray-600" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium capitalize">{method.brand}</span>
                              <span>•••• {method.last4}</span>
                              {method.isDefault && (
                                <Badge variant="default" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!method.isDefault && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setDefaultPaymentMethod(method.id)}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeletePaymentMethod(method.id)}
                            disabled={method.isDefault && paymentMethods.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {paymentMethods.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No payment methods found</p>
                    <p className="text-sm">Add a payment method to manage your subscription</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5 text-green-600" />
                <span>Billing History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingHistory.map((bill) => (
                  <Card key={bill.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{bill.description}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(bill.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="font-medium">${bill.amount}</p>
                            <Badge 
                              variant={bill.status === 'paid' ? 'default' : bill.status === 'pending' ? 'secondary' : 'destructive'}
                            >
                              {bill.status}
                            </Badge>
                          </div>
                          {bill.invoiceUrl && (
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {billingHistory.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No billing history found</p>
                    <p className="text-sm">Your billing history will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
