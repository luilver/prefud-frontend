
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Coffee, Clock, Users, Thermometer, Target, Shield } from "lucide-react";

interface DrinkViewProps {
  drink: any;
  onBack: () => void;
  onEdit: () => void;
}

const DrinkView = ({ drink, onBack, onEdit }: DrinkViewProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Healthy Drinks
          </Button>
        </div>
        <Button 
          onClick={onEdit}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit Drink
        </Button>
      </div>

      {/* Drink Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Coffee className="h-6 w-6 text-green-500" />
                {drink.name || 'Healthy Drink Recipe'}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {drink.category} • Created on {new Date(drink.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{drink.prepTime || '5'} min prep</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{drink.servings || drink.preferences?.people || 1} serving{(drink.servings || drink.preferences?.people || 1) > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Thermometer className="h-4 w-4" />
              <span className="capitalize">{drink.preferences?.temperature || 'Cold'}</span>
            </div>
            {drink.nutritionFacts?.calories && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Target className="h-4 w-4" />
                <span>{drink.nutritionFacts.calories} calories</span>
              </div>
            )}
          </div>

          {/* Health Goals & Dietary Restrictions */}
          <div className="flex flex-wrap gap-2 mt-4">
            {drink.healthGoals?.map((goal: string) => (
              <Badge key={goal} variant="secondary" className="bg-green-100 text-green-800">
                {goal}
              </Badge>
            ))}
            {drink.dietaryRestrictions?.map((restriction: string) => (
              <Badge key={restriction} variant="outline" className="border-blue-300 text-blue-700">
                <Shield className="h-3 w-3 mr-1" />
                {restriction}
              </Badge>
            ))}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>
                Everything you need for {drink.servings || drink.preferences?.people || 1} serving{(drink.servings || drink.preferences?.people || 1) > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {drink.ingredients?.map((ingredient: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <span className="font-medium">{ingredient.name}</span>
                      <span className="text-gray-600 ml-2">{ingredient.amount}</span>
                    </div>
                    {ingredient.calories && (
                      <span className="text-sm text-gray-500">{ingredient.calories} cal</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
              <CardDescription>Step-by-step preparation guide</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {drink.instructions?.map((instruction: string, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{instruction}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Instructions */}
          {drink.customInstructions && (
            <Card>
              <CardHeader>
                <CardTitle>Special Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{drink.customInstructions}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Nutrition Facts */}
          {drink.nutritionFacts && (
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Facts</CardTitle>
                <CardDescription>Per serving</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between py-1">
                    <span className="font-medium">Calories</span>
                    <span>{drink.nutritionFacts.calories}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between py-1">
                    <span>Protein</span>
                    <span>{drink.nutritionFacts.protein}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Carbohydrates</span>
                    <span>{drink.nutritionFacts.carbs}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Fat</span>
                    <span>{drink.nutritionFacts.fat}</span>
                  </div>
                  {drink.nutritionFacts.fiber && (
                    <div className="flex justify-between py-1">
                      <span>Fiber</span>
                      <span>{drink.nutritionFacts.fiber}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Health Benefits */}
          {drink.healthBenefits && drink.healthBenefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Health Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {drink.healthBenefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Drink Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sweetness</span>
                  <span className="text-sm font-medium capitalize">{drink.preferences?.sweetness || 'Medium'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Intensity</span>
                  <span className="text-sm font-medium capitalize">{drink.preferences?.intensity || 'Medium'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Temperature</span>
                  <span className="text-sm font-medium capitalize">{drink.preferences?.temperature || 'Cold'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DrinkView;
