
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Calendar, CreditCard, AlertTriangle, CheckCircle } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const SubscriptionManager = () => {
  const { user, updateSubscription } = useUser();
  const [isManaging, setIsManaging] = useState(false);

  if (!user) return null;

  const handleUpgrade = () => {
    // TODO: Integrate with your payment service
    console.log('Upgrading subscription...');
    setIsManaging(true);
    
    // Mock upgrade
    setTimeout(() => {
      updateSubscription({
        isSubscribed: true,
        plan: 'premium',
        planLimits: {
          plansPerMonth: 5,
          usedPlans: user.subscription.planLimits.usedPlans,
        },
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setIsManaging(false);
    }, 2000);
  };

  const handleCancel = () => {
    // TODO: Integrate with your subscription service
    console.log('Cancelling subscription...');
    setIsManaging(true);
    
    // Mock cancellation
    setTimeout(() => {
      updateSubscription({
        cancelAtPeriodEnd: true,
      });
      setIsManaging(false);
    }, 1000);
  };

  const handleReactivate = () => {
    // TODO: Integrate with your subscription service
    console.log('Reactivating subscription...');
    setIsManaging(true);
    
    setTimeout(() => {
      updateSubscription({
        cancelAtPeriodEnd: false,
      });
      setIsManaging(false);
    }, 1000);
  };

  const usagePercentage = (user.subscription.planLimits.usedPlans / user.subscription.planLimits.plansPerMonth) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Subscription Management</h2>
        <p className="text-gray-600">Manage your MealCraft subscription and billing</p>
      </div>

      {/* Current Plan */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <span className="text-purple-800">Current Plan</span>
            </div>
            <Badge variant={user.subscription.isSubscribed ? "default" : "secondary"}>
              {user.subscription.plan === 'premium' ? 'Premium' : 'Free'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">Plan Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monthly Plans:</span>
                  <span className="font-medium">{user.subscription.planLimits.plansPerMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span>Used This Month:</span>
                  <span className="font-medium">{user.subscription.planLimits.usedPlans}</span>
                </div>
                <div className="flex justify-between">
                  <span>Billing Cycle:</span>
                  <span className="font-medium capitalize">{user.subscription.billingCycle}</span>
                </div>
                {user.subscription.nextBilling && (
                  <div className="flex justify-between">
                    <span>Next Billing:</span>
                    <span className="font-medium">
                      {new Date(user.subscription.nextBilling).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">Usage This Month</h4>
              <Progress value={usagePercentage} className="mb-2" />
              <p className="text-sm text-purple-600">
                {user.subscription.planLimits.usedPlans} of {user.subscription.planLimits.plansPerMonth} plans used
              </p>
              
              {usagePercentage >= 80 && (
                <div className="flex items-center space-x-2 mt-3 p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-700">
                    {usagePercentage >= 100 ? 'Plan limit reached' : 'Approaching plan limit'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {user.subscription.cancelAtPeriodEnd && (
            <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Your subscription will cancel at the end of the current billing period
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {!user.subscription.isSubscribed ? (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700">Upgrade to Premium</CardTitle>
              <CardDescription>
                Get more meal plans and exclusive features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">5 meal plans per month</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Grocery store integration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Recipe video tutorials</span>
                </div>
              </div>
              <Button 
                onClick={handleUpgrade}
                disabled={isManaging}
                className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
              >
                {isManaging ? 'Processing...' : 'Upgrade to Premium - $9.99/month'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-700">
                <CreditCard className="h-5 w-5" />
                <span>Billing Management</span>
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" disabled={isManaging}>
                <CreditCard className="h-4 w-4 mr-2" />
                Update Payment Method
              </Button>
              <Button variant="outline" className="w-full" disabled={isManaging}>
                <Calendar className="h-4 w-4 mr-2" />
                View Billing History
              </Button>
              {user.subscription.cancelAtPeriodEnd ? (
                <Button 
                  onClick={handleReactivate}
                  disabled={isManaging}
                  className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
                >
                  {isManaging ? 'Processing...' : 'Reactivate Subscription'}
                </Button>
              ) : (
                <Button 
                  onClick={handleCancel}
                  disabled={isManaging}
                  variant="destructive" 
                  className="w-full"
                >
                  {isManaging ? 'Processing...' : 'Cancel Subscription'}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">Need Help?</CardTitle>
            <CardDescription>
              Get support with your subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
            <Button variant="outline" className="w-full">
              View FAQ
            </Button>
            <Button variant="outline" className="w-full">
              Billing Questions
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionManager;
