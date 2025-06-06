
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Settings, Target, Crown, Bell, Shield } from "lucide-react";

interface UserData {
  name: string;
  email: string;
  age: number;
  weight: number;
  height: number;
  activity_level: string;
  dietary_preferences: string[];
  allergies: string[];
  daily_calorie_goal: number;
  meals_per_day: number;
  people_count: number;
}

const UserProfile = () => {
  const [userData, setUserData] = useState<UserData>({
    name: "John Doe",
    email: "john.doe@example.com",
    age: 32,
    weight: 175,
    height: 70,
    activity_level: "moderate",
    dietary_preferences: ["Balanced", "High Protein"],
    allergies: ["Nuts"],
    daily_calorie_goal: 2000,
    meals_per_day: 3,
    people_count: 2
  });

  const [isSubscribed] = useState(true);
  const [subscriptionPlan] = useState("Premium");

  const handleInputChange = (field: keyof UserData, value: any) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateBMI = () => {
    const heightInMeters = (userData.height * 2.54) / 100;
    const weightInKg = userData.weight * 0.453592;
    return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-600" };
    if (bmi < 25) return { category: "Normal", color: "text-green-600" };
    if (bmi < 30) return { category: "Overweight", color: "text-orange-600" };
    return { category: "Obese", color: "text-red-600" };
  };

  const bmi = parseFloat(calculateBMI());
  const bmiInfo = getBMICategory(bmi);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600">
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Personal Information */}
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
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={userData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="border-green-200 focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="border-green-200 focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={userData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                  className="border-green-200 focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="activity">Activity Level</Label>
                <select
                  id="activity"
                  value={userData.activity_level}
                  onChange={(e) => handleInputChange('activity_level', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-green-200 rounded-md focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light Exercise</option>
                  <option value="moderate">Moderate Exercise</option>
                  <option value="active">Very Active</option>
                  <option value="extra">Extra Active</option>
                </select>
              </div>
            </div>

            {/* Physical Stats */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Physical Stats</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={userData.weight}
                    onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                    className="border-green-200 focus:border-green-400"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (inches)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={userData.height}
                    onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
                    className="border-green-200 focus:border-green-400"
                  />
                </div>
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

            {/* Meal Planning Preferences */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Meal Planning</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="calories">Daily Calorie Goal</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={userData.daily_calorie_goal}
                    onChange={(e) => handleInputChange('daily_calorie_goal', parseInt(e.target.value))}
                    className="border-green-200 focus:border-green-400"
                  />
                </div>
                <div>
                  <Label htmlFor="meals">Meals per Day</Label>
                  <Input
                    id="meals"
                    type="number"
                    min="1"
                    max="6"
                    value={userData.meals_per_day}
                    onChange={(e) => handleInputChange('meals_per_day', parseInt(e.target.value))}
                    className="border-green-200 focus:border-green-400"
                  />
                </div>
                <div>
                  <Label htmlFor="people">People Count</Label>
                  <Input
                    id="people"
                    type="number"
                    min="1"
                    value={userData.people_count}
                    onChange={(e) => handleInputChange('people_count', parseInt(e.target.value))}
                    className="border-green-200 focus:border-green-400"
                  />
                </div>
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
                        onClick={() => {
                          const currentPrefs = userData.dietary_preferences;
                          const newPrefs = currentPrefs.includes(diet)
                            ? currentPrefs.filter(p => p !== diet)
                            : [...currentPrefs, diet];
                          handleInputChange('dietary_preferences', newPrefs);
                        }}
                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                          userData.dietary_preferences.includes(diet)
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {diet}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="allergies">Allergies & Restrictions</Label>
                  <Textarea
                    id="allergies"
                    placeholder="List any food allergies or restrictions..."
                    value={userData.allergies.join(', ')}
                    onChange={(e) => handleInputChange('allergies', e.target.value.split(', ').filter(a => a.trim()))}
                    className="border-green-200 focus:border-green-400"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription & Health Stats */}
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

                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Health Goals */}
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
                  <p className="text-2xl font-bold text-green-700">{userData.daily_calorie_goal}</p>
                  <p className="text-sm text-green-600">Target intake</p>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-medium text-orange-800">Meal Planning</h4>
                  <p className="text-2xl font-bold text-orange-700">{userData.meals_per_day}</p>
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
