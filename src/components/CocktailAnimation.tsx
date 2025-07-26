
import { useState, useEffect } from "react";

const CocktailAnimation = () => {
  const [blendingStep, setBlendingStep] = useState(0);
  const [ingredients, setIngredients] = useState([
    { name: "Fresh Fruits", color: "bg-red-400", added: false },
    { name: "Leafy Greens", color: "bg-green-400", added: false },
    { name: "Healthy Liquids", color: "bg-blue-400", added: false },
    { name: "Superfoods", color: "bg-purple-400", added: false },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setBlendingStep(prev => {
        if (prev < ingredients.length) {
          setIngredients(current => 
            current.map((ing, index) => 
              index === prev ? { ...ing, added: true } : ing
            )
          );
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    return () => clearInterval(timer);
  }, [ingredients.length]);

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Blender Container */}
      <div className="relative">
        {/* Blender Base */}
        <div className="w-32 h-20 bg-gray-700 rounded-lg relative">
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        
        {/* Blender Jar */}
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-b from-transparent to-gray-100 border-2 border-gray-300 rounded-t-lg relative overflow-hidden">
          {/* Liquid */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-400 via-yellow-300 to-orange-300 transition-all duration-1000 animate-pulse"
               style={{ height: `${Math.min(blendingStep * 20, 80)}%` }}>
            {/* Bubbles */}
            <div className="absolute top-1 left-2 w-2 h-2 bg-white rounded-full animate-bounce opacity-70"></div>
            <div className="absolute top-3 right-2 w-1 h-1 bg-white rounded-full animate-bounce opacity-70" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute top-2 left-1/2 w-1.5 h-1.5 bg-white rounded-full animate-bounce opacity-70" style={{ animationDelay: '0.4s' }}></div>
          </div>
          
          {/* Blender Blades (spinning) */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-400 animate-spin"></div>
        </div>
        
        {/* Ingredient particles falling */}
        <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-32 h-16">
          {ingredients.map((ingredient, index) => (
            <div
              key={index}
              className={`absolute w-2 h-2 rounded-full ${ingredient.color} ${
                ingredient.added ? 'animate-bounce' : 'opacity-0'
              }`}
              style={{
                left: `${20 + index * 15}%`,
                top: `${index * 10}px`,
                animationDelay: `${index * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Ingredients List */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-green-800 text-center">Adding Ingredients...</h3>
        <div className="grid grid-cols-2 gap-2">
          {ingredients.map((ingredient, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-500 ${
                ingredient.added 
                  ? 'bg-green-100 border-2 border-green-300 text-green-700' 
                  : 'bg-gray-100 border-2 border-gray-200 text-gray-400'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${ingredient.color} ${ingredient.added ? 'animate-pulse' : ''}`}></div>
              <span className="text-sm font-medium">{ingredient.name}</span>
              {ingredient.added && <span className="text-green-600 text-sm">✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Status Messages */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
          <span className="text-green-700 font-medium">
            {blendingStep < ingredients.length 
              ? `Adding ${ingredients[blendingStep]?.name || 'ingredients'}...`
              : 'Blending to perfection...'
            }
          </span>
        </div>
        <p className="text-sm text-green-600">Creating your perfect healthy drink</p>
      </div>
    </div>
  );
};

export default CocktailAnimation;
