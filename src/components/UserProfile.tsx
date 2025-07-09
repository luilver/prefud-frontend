
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, Target, Crown, Bell } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import PaymentForm from "./PaymentForm";

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
  const { user, updateUserProfile } = useUser();
  const { toast } = useToast();
  const [isSubscribed] = useState(user?.subscription?.isSubscribed || false);
  const [subscriptionPlan] = useState(user?.subscription?.plan === 'premium' ? 'Premium' : 'Free');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // Default premium plan for subscription management
  const premiumPlan = {
    id: "premium",
    name: "Premium Plan",
    price: 9.99,
    interval: "month",
    features: [
      "AI Meal Recommendations",
      "Grocery Store Integration", 
      "Unlimited Meal Plans",
      "Recipe Videos"
    ],
    popular: true
  };

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
    }
  }, [user, form]);

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
    if (isSubscribed) {
      // For existing subscribers, show billing management
      toast({
        title: "Subscription Management",
        description: "Redirecting to billing portal...",
      });
    } else {
      // For non-subscribers, show payment form
      setShowPaymentForm(true);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    toast({
      title: "Subscription Activated!",
      description: "Welcome to Premium! Your subscription is now active.",
    });
    setShowPaymentForm(false);
    // Here you would typically update the user's subscription status
  };

  const bmi = parseFloat(calculateBMI());
  const bmiInfo = getBMICategory(bmi);

  if (showPaymentForm) {
    return (
      <PaymentForm
        onSuccess={handlePaymentSuccess}
        onBack={() => setShowPaymentForm(false)}
        userInfo={{
          email: form.watch('email'),
          phone: `${form.watch('phonePrefix')}${form.watch('phone')}`
        }}
        selectedPlan={premiumPlan}
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
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <div className="flex space-x-2">
                      <FormField
                        control={form.control}
                        name="phonePrefix"
                        render={({ field }) => (
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="w-20 border-green-200 focus:border-green-400">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="+1">+1</SelectItem>
                                <SelectItem value="+44">+44</SelectItem>
                                <SelectItem value="+33">+33</SelectItem>
                                <SelectItem value="+49">+49</SelectItem>
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
          {/* Subscription Status */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-700">
                <Crown className="h-5 w-5" />
                <span>Subscription</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-purple-800">{subscriptionPlan} Plan</p>
                    <p className="text-sm text-purple-600">
                      {isSubscribed ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    isSubscribed 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {isSubscribed ? 'Active' : 'Expired'}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-purple-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>AI Meal Recommendations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Grocery Store Integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Unlimited Meal Plans</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Recipe Videos</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={handleManageSubscription}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isSubscribed ? 'Manage Subscription' : 'Get Premium'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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

          {/* Notifications */}
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
    </div>
  );
};

export default UserProfile;
