
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  Download, 
  Plus, 
  Trash2, 
  Check, 
  Star,
  Calendar,
  DollarSign,
  AlertCircle,
  History
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const BillingManagement = () => {
  const { 
    user, 
    billingHistory, 
    paymentMethods, 
    getBillingHistory, 
    getPaymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    acceptSubscription,
    cancelSubscription
  } = useUser();

  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  useEffect(() => {
    if (user?.subscription.isSubscribed) {
      getBillingHistory();
      getPaymentMethods();
    }
  }, [user]);

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await addPaymentMethod(newCard);
      setShowAddCard(false);
      setNewCard({ cardNumber: '', expiryDate: '', cvv: '', cardName: '' });
      await getPaymentMethods();
    } catch (error) {
      console.error('Failed to add payment method:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    setIsLoading(true);
    try {
      await deletePaymentMethod(methodId);
      await getPaymentMethods();
    } catch (error) {
      console.error('Failed to delete payment method:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await acceptSubscription('premium');
    } catch (error) {
      console.error('Failed to subscribe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      await cancelSubscription();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
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

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Billing Management</h2>
        <p className="text-gray-600">Manage your subscription, payment methods, and billing history</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="billing-history">Billing History</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Plan Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <span>Current Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold capitalize">{user.subscription.plan} Plan</h3>
                  <p className="text-gray-600">
                    {user.subscription.planLimits.plansPerMonth} meal plans per month
                  </p>
                  {user.subscription.nextBilling && (
                    <p className="text-sm text-gray-500">
                      Next billing: {new Date(user.subscription.nextBilling).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Badge variant={user.subscription.isSubscribed ? "default" : "secondary"}>
                  {user.subscription.isSubscribed ? 'Active' : 'Free'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!user.subscription.isSubscribed ? (
                  <Button 
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-orange-500"
                  >
                    Upgrade to Premium
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="w-full justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Payment Methods
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <History className="h-4 w-4 mr-2" />
                      View Billing History
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

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
          </div>
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Payment Methods</h3>
            <Button onClick={() => setShowAddCard(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>

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
          </div>
        </TabsContent>

        <TabsContent value="billing-history" className="space-y-6">
          <h3 className="text-lg font-semibold">Billing History</h3>
          
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
          </div>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <h3 className="text-lg font-semibold">Subscription Management</h3>
          
          {user.subscription.isSubscribed ? (
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
                {user.subscription.cancelAtPeriodEnd ? (
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
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Upgrade to Premium</CardTitle>
                <CardDescription>
                  Get more meal plans and access to premium features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold">Free Plan</h4>
                      <p className="text-2xl font-bold">$0</p>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• 1 meal plan per month</li>
                        <li>• Basic recipe access</li>
                      </ul>
                    </div>
                    <div className="p-4 border-2 border-green-500 rounded-lg bg-green-50">
                      <h4 className="font-semibold text-green-800">Premium Plan</h4>
                      <p className="text-2xl font-bold text-green-800">$9.99/month</p>
                      <ul className="mt-2 space-y-1 text-sm text-green-700">
                        <li>• 5 meal plans per month</li>
                        <li>• Video tutorials</li>
                        <li>• Advanced meal tracking</li>
                        <li>• Priority support</li>
                      </ul>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-orange-500"
                  >
                    {isLoading ? 'Processing...' : 'Upgrade to Premium - $9.99/month'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingManagement;
