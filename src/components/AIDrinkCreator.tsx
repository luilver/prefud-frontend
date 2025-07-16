
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Droplets } from "lucide-react";
import AIDrinkCreatorStepper from "./AIDrinkCreatorStepper";

const AIDrinkCreator = () => {
  const [showStepper, setShowStepper] = useState(false);

  if (showStepper) {
    return (
      <AIDrinkCreatorStepper 
        onBack={() => setShowStepper(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-800 mb-2">AI Healthy Drinks</h1>
        <p className="text-green-600">Create personalized healthy drinks with AI assistance</p>
      </div>

      <Card className="border-green-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <Droplets className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-green-800">Create Your Perfect Healthy Drink</CardTitle>
          <CardDescription className="text-green-600">
            Let AI help you create delicious and nutritious drinks tailored to your health goals and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={() => setShowStepper(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
          >
            Start Creating
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">🥤 Smoothies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600">Nutrient-packed smoothies for energy and wellness</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">🧃 Fresh Juices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600">Vitamin-rich fresh juices for detox and health</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">🍵 Wellness Teas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600">Herbal and wellness teas for relaxation and health</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIDrinkCreator;
