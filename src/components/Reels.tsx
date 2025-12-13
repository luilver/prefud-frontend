import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Bookmark, Play, Pause, Share2, ChefHat, Loader2, Eye, Clock, Flame, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ReelRecipeModal from "./ReelRecipeModal";
import { getReelsPaginated, Reel, ReelsMeta } from "@/services/reelsService";
import { useToast } from "@/hooks/use-toast";

interface DisplayRecipe {
  id: string;
  title: string;
  chef: string;
  duration: string;
  difficulty: string;
  videoUrl: string;
  thumbnail: string;
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  description: string;
  steps?: string[];
  ingredients?: Array<{ name: string; quantity: number; unit: string }>;
  calories?: number;
  nutritionalInfo?: {
    protein: number;
    fat: number;
    carbohydrates: number;
    fiber: number;
  };
  prepTip?: string;
  benefits?: string[];
  mealType?: string;
  servings?: number;
}

const mapReelToDisplayRecipe = (reel: Reel): DisplayRecipe => {
  let difficulty = 'Easy';
  if (reel.cookingTime > 60) difficulty = 'Hard';
  else if (reel.cookingTime > 30) difficulty = 'Medium';

  return {
    id: reel._id,
    title: reel.name,
    chef: reel.author,
    duration: `${reel.cookingTime} min`,
    difficulty,
    videoUrl: reel.videoUrl,
    thumbnail: reel.videoUrl, // Use video URL - browser will extract first frame via preload
    likes: reel.likes,
    isLiked: false,
    isSaved: false,
    description: reel.description,
    steps: reel.steps,
    ingredients: reel.ingredientsList?.map(ing => ({
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit
    })) || [],
    calories: reel.calories,
    nutritionalInfo: reel.nutritionalInfo,
    prepTip: reel.prepTip,
    benefits: reel.benefits,
    mealType: reel.mealType,
    servings: reel.servings
  };
};

const Reels = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<DisplayRecipe[]>([]);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [mutedVideos, setMutedVideos] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [meta, setMeta] = useState<ReelsMeta | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<DisplayRecipe | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Initial load
  useEffect(() => {
    const fetchInitialReels = async () => {
      try {
        setIsInitialLoading(true);
        const response = await getReelsPaginated(0, 8);
        const mappedRecipes = response.data.map(mapReelToDisplayRecipe);
        const newIds = new Set(mappedRecipes.map(r => r.id));
        setLoadedIds(newIds);
        setRecipes(mappedRecipes);
        setMeta(response.meta);
        setPage(response.meta.currentPage); // API returns 1-based page
      } catch (error) {
        console.error('Error fetching initial reels:', error);
        toast({
          title: "Error",
          description: "Failed to load recipes. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchInitialReels();
  }, [toast]);

  const loadMoreRecipes = useCallback(async () => {
    if (isLoading || !meta?.hasNextPage) return;

    setIsLoading(true);
    try {
      // API uses 0-based page index, so currentPage (1-based) equals next page index
      const nextPageIndex = page;
      console.log('Loading page:', nextPageIndex, 'Current page:', page, 'Has next:', meta?.hasNextPage);
      
      const response = await getReelsPaginated(nextPageIndex, 8);
      const mappedRecipes = response.data.map(mapReelToDisplayRecipe);
      
      // Filter out duplicates
      const newRecipes = mappedRecipes.filter(r => !loadedIds.has(r.id));
      
      console.log('Fetched recipes:', mappedRecipes.length, 'New recipes:', newRecipes.length);
      
      if (newRecipes.length > 0) {
        setLoadedIds(prev => {
          const updated = new Set(prev);
          newRecipes.forEach(r => updated.add(r.id));
          return updated;
        });
        setRecipes(prev => [...prev, ...newRecipes]);
      }
      
      setMeta(response.meta);
      setPage(response.meta.currentPage);
    } catch (error) {
      console.error('Error loading more recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load more recipes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, meta?.hasNextPage, page, loadedIds, toast]);

  const toggleVideoPlay = (recipeId: string) => {
    const video = videoRefs.current.get(recipeId);
    if (!video) return;

    if (playingVideo === recipeId) {
      video.pause();
      setPlayingVideo(null);
    } else {
      // Pause any currently playing video
      if (playingVideo) {
        const currentVideo = videoRefs.current.get(playingVideo);
        currentVideo?.pause();
      }
      video.play().catch(console.error);
      setPlayingVideo(recipeId);
    }
  };

  const toggleMute = (recipeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRefs.current.get(recipeId);
    if (!video) return;

    setMutedVideos(prev => {
      const updated = new Set(prev);
      if (updated.has(recipeId)) {
        updated.delete(recipeId);
        video.muted = false;
      } else {
        updated.add(recipeId);
        video.muted = true;
      }
      return updated;
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMoreRecipes();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreRecipes]);

  const toggleLike = (id: string) => {
    setRecipes(prev => prev.map(recipe => 
      recipe.id === id 
        ? { ...recipe, isLiked: !recipe.isLiked, likes: recipe.isLiked ? recipe.likes - 1 : recipe.likes + 1 }
        : recipe
    ));
  };

  const toggleSave = (id: string) => {
    setRecipes(prev => prev.map(recipe => 
      recipe.id === id 
        ? { ...recipe, isSaved: !recipe.isSaved }
        : recipe
    ));
  };

  const handleViewRecipe = (recipe: DisplayRecipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMealTypeColor = (mealType?: string) => {
    switch (mealType?.toLowerCase()) {
      case 'breakfast': return 'bg-yellow-100 text-yellow-700';
      case 'lunch': return 'bg-blue-100 text-blue-700';
      case 'dinner': return 'bg-purple-100 text-purple-700';
      case 'dessert': return 'bg-pink-100 text-pink-700';
      case 'snack': return 'bg-green-100 text-green-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-muted-foreground animate-pulse">Loading delicious recipes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Hidden on mobile, visible on desktop */}
      <div className="text-center space-y-2 hidden md:block">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="p-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl">
            <Play className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Recipe Reels
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover amazing recipes through short cooking videos. Learn new techniques, get inspired, and save your favorites!
        </p>
        {meta && (
          <p className="text-sm text-muted-foreground">
            Showing {recipes.length} of {meta.totalItems} recipes
          </p>
        )}
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-card/70 backdrop-blur-sm">
            <div className="relative">
              {/* Video Thumbnail */}
              <div 
                className="relative aspect-[9/16] overflow-hidden rounded-t-lg bg-muted cursor-pointer"
                onClick={() => recipe.videoUrl && toggleVideoPlay(recipe.id)}
              >
                {recipe.videoUrl ? (
                  <>
                    <video 
                      ref={(el) => {
                        if (el) videoRefs.current.set(recipe.id, el);
                      }}
                      src={recipe.videoUrl}
                      className="w-full h-full object-cover"
                      muted={mutedVideos.has(recipe.id)}
                      loop
                      playsInline
                      preload="metadata"
                    />
                    {/* Play/Pause Overlay */}
                    <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300 ${playingVideo === recipe.id ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                      <div className="rounded-full w-16 h-16 bg-white/90 flex items-center justify-center shadow-lg">
                        {playingVideo === recipe.id ? (
                          <Pause className="h-6 w-6 text-black" />
                        ) : (
                          <Play className="h-6 w-6 text-black ml-1" />
                        )}
                      </div>
                    </div>
                    {/* Mute Button */}
                    {playingVideo === recipe.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white border-0 z-10"
                        onClick={(e) => toggleMute(recipe.id, e)}
                      >
                        {mutedVideos.has(recipe.id) ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </>
                ) : (
                  <img 
                    src={recipe.thumbnail} 
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}

                {/* Duration Badge */}
                <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {recipe.duration}
                </div>

                {/* Meal Type Badge */}
                {recipe.mealType && (
                  <div className={`absolute top-10 left-3 px-2 py-1 rounded-md text-xs font-medium capitalize ${getMealTypeColor(recipe.mealType)}`}>
                    {recipe.mealType}
                  </div>
                )}

                {/* Difficulty Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                  {recipe.difficulty}
                </div>

                {/* Calories Badge */}
                {recipe.calories && (
                  <div className="absolute top-10 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-400" />
                    {recipe.calories} cal
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute bottom-3 right-3 flex flex-col space-y-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(recipe.id);
                    }}
                  >
                    <Heart className={`h-4 w-4 ${recipe.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(recipe.id);
                    }}
                  >
                    <Bookmark className={`h-4 w-4 ${recipe.isSaved ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewRecipe(recipe);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Recipe Info */}
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-lg line-clamp-2 mb-1">{recipe.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <ChefHat className="h-4 w-4" />
                      <span>{recipe.chef}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recipe.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      <span>{recipe.likes.toLocaleString()}</span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => handleViewRecipe(recipe)}
                    >
                      View Recipe
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading more recipes...</span>
          </div>
        </div>
      )}

      {/* End of Content Message */}
      {meta && !meta.hasNextPage && recipes.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">You've reached the end! No more recipes to load.</p>
        </div>
      )}

      {/* Empty State */}
      {!isInitialLoading && recipes.length === 0 && (
        <div className="text-center py-16">
          <ChefHat className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
          <p className="text-muted-foreground">Check back later for delicious recipes!</p>
        </div>
      )}

      {/* Recipe Modal */}
      <ReelRecipeModal
        recipe={selectedRecipe}
        isOpen={showRecipeModal}
        onClose={() => {
          setShowRecipeModal(false);
          setSelectedRecipe(null);
        }}
      />
    </div>
  );
};

export default Reels;
