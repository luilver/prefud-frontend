
// Mock service for meal plan operations
export interface MealPlanUpdateRequest {
  planId: string;
  date: string;
  meal: any;
  operation: 'add' | 'substitute' | 'remove';
  mealType?: 'meal' | 'snack';
  targetMealId?: string;
}

export interface MealPlanUpdateResponse {
  success: boolean;
  message: string;
  updatedPlan?: any;
}

class MealPlanService {
  // Mock API delay
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Add meal to a specific day in meal plan
  async addMealToPlan(request: MealPlanUpdateRequest): Promise<MealPlanUpdateResponse> {
    console.log('MealPlanService: Adding meal to plan', request);
    
    await this.delay();
    
    try {
      // Mock validation
      if (!request.planId || !request.date || !request.meal) {
        throw new Error('Missing required fields');
      }

      // Mock successful response
      return {
        success: true,
        message: `Meal "${request.meal.name}" added successfully`,
        updatedPlan: {
          id: request.planId,
          lastUpdated: new Date().toISOString(),
          // In a real implementation, this would return the full updated plan
        }
      };
    } catch (error) {
      console.error('MealPlanService: Error adding meal', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add meal'
      };
    }
  }

  // Substitute an existing meal
  async substituteMeal(request: MealPlanUpdateRequest): Promise<MealPlanUpdateResponse> {
    console.log('MealPlanService: Substituting meal', request);
    
    await this.delay();
    
    try {
      if (!request.planId || !request.date || !request.meal || !request.targetMealId) {
        throw new Error('Missing required fields for substitution');
      }

      return {
        success: true,
        message: `Meal substituted successfully`,
        updatedPlan: {
          id: request.planId,
          lastUpdated: new Date().toISOString(),
        }
      };
    } catch (error) {
      console.error('MealPlanService: Error substituting meal', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to substitute meal'
      };
    }
  }

  // Remove meal from plan
  async removeMealFromPlan(request: MealPlanUpdateRequest): Promise<MealPlanUpdateResponse> {
    console.log('MealPlanService: Removing meal from plan', request);
    
    await this.delay();
    
    try {
      if (!request.planId || !request.targetMealId) {
        throw new Error('Missing required fields for removal');
      }

      return {
        success: true,
        message: 'Meal removed successfully',
        updatedPlan: {
          id: request.planId,
          lastUpdated: new Date().toISOString(),
        }
      };
    } catch (error) {
      console.error('MealPlanService: Error removing meal', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove meal'
      };
    }
  }

  // Get meals for a specific date
  async getMealsForDate(planId: string, date: string): Promise<any[]> {
    console.log('MealPlanService: Getting meals for date', { planId, date });
    
    await this.delay(200);
    
    // Mock response - in real implementation, this would fetch from API
    return [
      // This would return actual meals from the database
    ];
  }

  // Validate meal plan constraints
  validateMealAddition(existingMeals: any[], newMeal: any, mealType: 'meal' | 'snack'): {
    canAdd: boolean;
    requiresConflictResolution: boolean;
    message: string;
  } {
    const regularMeals = existingMeals.filter(meal => meal.mealType !== 'snack');
    
    if (mealType === 'snack') {
      return {
        canAdd: true,
        requiresConflictResolution: false,
        message: 'Can add as snack'
      };
    }

    if (regularMeals.length >= 3) {
      return {
        canAdd: false,
        requiresConflictResolution: true,
        message: 'Day already has 3 meals. Choose to add as snack or substitute existing meal.'
      };
    }

    return {
      canAdd: true,
      requiresConflictResolution: false,
      message: 'Can add meal'
    };
  }
}

// Export singleton instance
export const mealPlanService = new MealPlanService();
export default mealPlanService;
