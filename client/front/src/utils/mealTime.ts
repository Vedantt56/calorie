// Meal time categorization based on hour
export type MealType = "breakfast" | "lunch" | "snacks" | "dinner";

export const getMealTimeOfDay = (hour: number): MealType => {
  if (hour >= 5 && hour < 12) return "breakfast";
  if (hour >= 12 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 19) return "snacks";
  return "dinner"; // 19:00 - 04:59
};

export const getMealTypeLabel = (type: MealType): string => {
  const labels: Record<MealType, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    snacks: "Snacks",
    dinner: "Dinner",
  };
  return labels[type];
};

export const getMealTypeColor = (type: MealType): string => {
  const colors: Record<MealType, string> = {
    breakfast: "#fbbf24",
    lunch: "#60a5fa",
    snacks: "#f472b6",
    dinner: "#a78bfa",
  };
  return colors[type];
};

export const getCurrentMealTime = (): MealType => {
  return getMealTimeOfDay(new Date().getHours());
};
