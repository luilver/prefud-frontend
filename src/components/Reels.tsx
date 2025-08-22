
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Bookmark, Play, Pause, Volume2, VolumeX, Share2, ChefHat, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Recipe {
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
}

const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Perfect Pasta Carbonara",
    chef: "Chef Marco",
    duration: "15 min",
    difficulty: "Easy",
    videoUrl: "",
    thumbnail: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?q=80&w=1000",
    likes: 1205,
    isLiked: false,
    isSaved: false,
    description: "Learn the authentic Italian way to make creamy carbonara without cream!"
  },
  {
    id: "2",
    title: "Fluffy Japanese Pancakes",
    chef: "Chef Yuki",
    duration: "25 min",
    difficulty: "Medium",
    videoUrl: "",
    thumbnail: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1000",
    likes: 892,
    isLiked: true,
    isSaved: false,
    description: "Master the technique for super fluffy, jiggly Japanese-style pancakes."
  },
  {
    id: "3",
    title: "Homemade Pizza Dough",
    chef: "Chef Isabella",
    duration: "2 hours",
    difficulty: "Medium",
    videoUrl: "",
    thumbnail: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?q=80&w=1000",
    likes: 2341,
    isLiked: false,
    isSaved: true,
    description: "The secret to perfect pizza dough that's crispy outside and chewy inside."
  },
  {
    id: "4",
    title: "Chocolate Lava Cake",
    chef: "Chef Pierre",
    duration: "30 min",
    difficulty: "Hard",
    videoUrl: "",
    thumbnail: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=1000",
    likes: 3456,
    isLiked: true,
    isSaved: true,
    description: "Create the perfect molten chocolate center with this foolproof technique."
  }
];

// Additional mock recipes for infinite scroll
const generateMoreRecipes = (startId: number, count: number): Recipe[] => {
  const additionalRecipes = [
    {
      title: "Thai Green Curry",
      chef: "Chef Siriporn",
      duration: "30 min",
      difficulty: "Medium",
      thumbnail: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=1000",
      description: "Authentic Thai green curry with fresh herbs and coconut milk."
    },
    {
      title: "French Croissants",
      chef: "Chef Antoine",
      duration: "4 hours",
      difficulty: "Hard",
      thumbnail: "https://images.unsplash.com/photo-1555507036-ab794f4afe5b?q=80&w=1000",
      description: "Master the art of laminated dough for perfect buttery croissants."
    },
    {
      title: "Korean Bibimbap",
      chef: "Chef Min-jun",
      duration: "45 min",
      difficulty: "Medium",
      thumbnail: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=1000",
      description: "Colorful Korean rice bowl with vegetables and spicy gochujang."
    },
    {
      title: "Indian Butter Chicken",
      chef: "Chef Priya",
      duration: "1 hour",
      difficulty: "Medium",
      thumbnail: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000",
      description: "Creamy and aromatic butter chicken with fragrant basmati rice."
    },
    {
      title: "Mexican Tacos Al Pastor",
      chef: "Chef Carlos",
      duration: "40 min",
      difficulty: "Easy",
      thumbnail: "https://images.unsplash.com/photo-1565299585323-38174c97e30d?q=80&w=1000",
      description: "Traditional Mexican tacos with marinated pork and pineapple."
    },
    {
      title: "Japanese Ramen",
      chef: "Chef Takeshi",
      duration: "3 hours",
      difficulty: "Hard",
      thumbnail: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?q=80&w=1000",
      description: "Rich tonkotsu ramen with perfectly cooked noodles and toppings."
    }
  ];

  return Array.from({ length: count }, (_, index) => {
    const recipeTemplate = additionalRecipes[index % additionalRecipes.length];
    return {
      id: (startId + index).toString(),
      ...recipeTemplate,
      videoUrl: "",
      likes: Math.floor(Math.random() * 5000) + 100,
      isLiked: Math.random() > 0.7,
      isSaved: Math.random() > 0.8,
    };
  });
};

// Simulate API call
const fetchMoreRecipes = async (page: number, limit: number = 8): Promise<Recipe[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  const startId = (page - 1) * limit + mockRecipes.length + 1;
  return generateMoreRecipes(startId, limit);
};

const Reels = () => {
  const { t } = useLanguage();
  const [recipes, setRecipes] = useState<Recipe[]>(mockRecipes);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreRecipes = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const newRecipes = await fetchMoreRecipes(page + 1);
      
      if (newRecipes.length === 0) {
        setHasMore(false);
      } else {
        setRecipes(prev => [...prev, ...newRecipes]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading more recipes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page]);

  // Infinite scroll effect
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Hidden on mobile, visible on desktop */}
      <div className="text-center space-y-2 hidden sm:block">
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
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-card/70 backdrop-blur-sm">
            <div className="relative">
              {/* Video Thumbnail */}
              <div className="relative aspect-[9/16] overflow-hidden rounded-t-lg">
                <img 
                  src={recipe.thumbnail} 
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    size="lg" 
                    className="rounded-full w-16 h-16 bg-white/90 hover:bg-white text-black hover:text-black shadow-lg"
                    onClick={() => setCurrentVideo(currentVideo === recipe.id ? null : recipe.id)}
                  >
                    {currentVideo === recipe.id ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 ml-1" />
                    )}
                  </Button>
                </div>

                {/* Duration Badge */}
                <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium">
                  {recipe.duration}
                </div>

                {/* Difficulty Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                  {recipe.difficulty}
                </div>

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
                    
                    <Button variant="outline" size="sm" className="text-xs">
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
      {!hasMore && recipes.length > mockRecipes.length && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">You've reached the end! No more recipes to load.</p>
        </div>
      )}
    </div>
  );
};

export default Reels;
