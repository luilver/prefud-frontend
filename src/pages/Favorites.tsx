import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart, ChefHat, Clock, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";

const Favorites = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useUser();

  // Mock favorites data - in real app this would come from user's favorites
  const favoriteRecipes = [
    // Empty for now - will be populated with actual favorite recipes data
  ];

  const handleDiscoverRecipes = () => {
    navigate("/");
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full p-8 mb-6">
        <Heart className="h-16 w-16 text-primary/60" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-4">
        {t("favorites.empty.title")}
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        {t("favorites.empty.description")}
      </p>
      <Button
        onClick={handleDiscoverRecipes}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <ChefHat className="h-4 w-4 mr-2" />
        {t("favorites.empty.cta")}
      </Button>
    </div>
  );

  const RecipeCard = ({ recipe }: { recipe: any }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {recipe.title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Heart className="h-4 w-4 fill-current" />
          </Button>
        </div>
        <CardDescription className="line-clamp-2">
          {recipe.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{recipe.cookTime}min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{recipe.servings}</span>
            </div>
          </div>
          <Button variant="outline" size="sm">
            View Recipe
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t("favorites.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("favorites.subtitle")}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="hidden sm:flex"
            >
              Back to Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {favoriteRecipes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteRecipes.map((recipe, index) => (
              <RecipeCard key={index} recipe={recipe} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile back button */}
      <div className="sm:hidden fixed bottom-4 right-4">
        <Button
          onClick={() => navigate(-1)}
          className="rounded-full shadow-lg"
          size="lg"
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default Favorites;