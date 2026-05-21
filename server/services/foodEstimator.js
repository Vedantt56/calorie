import { cookedFoodItems, categoryEstimates, simpleUsdaFoods } from "../data/indianFoodData.js";
import { getNutritionFromUSDA } from "./usdaservice.js";
import { convertMacros, getWeightInGrams, normalizeUnit } from "../utils/unitmap.js";

const normalizeText = (value = "") => {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const hasPhrase = (text, phrase) => {
  const normalizedPhrase = normalizeText(phrase);
  return text === normalizedPhrase || text.includes(normalizedPhrase);
};

const getSize = (size) => {
  return ["small", "medium", "large"].includes(size) ? size : "medium";
};

const findCookedFood = (foodName) => {
  const normalizedName = normalizeText(foodName);
  const matches = [];

  cookedFoodItems.forEach((item) => {
    item.aliases.forEach((alias) => {
      const normalizedAlias = normalizeText(alias);
      if (hasPhrase(normalizedName, normalizedAlias)) {
        matches.push({ item, score: normalizedAlias.length });
      }
    });
  });

  matches.sort((a, b) => b.score - a.score);

  return matches[0]?.item || null;
};

const findCategoryEstimate = (foodName, categoryHint) => {
  const normalizedName = normalizeText(`${foodName} ${categoryHint || ""}`);

  return categoryEstimates.find((category) => {
    return category.patterns.some((pattern) => hasPhrase(normalizedName, pattern));
  });
};

const isSimpleUsdaFood = (foodName) => {
  const normalizedName = normalizeText(foodName);
  return simpleUsdaFoods.some((food) => hasPhrase(normalizedName, food));
};

const shouldPreferUsdaBeforeCookedDb = (foodName) => {
  const normalizedName = normalizeText(foodName);
  return normalizedName.includes("raw ");
};

const buildUsdaEstimate = async (item) => {
  const quantity = Number(item.quantity);
  const unit = normalizeUnit(item.unit);
  const nutritionPer100g = await getNutritionFromUSDA(item.foodName);
  const baseNutrition = convertMacros(nutritionPer100g, quantity, unit, item.size);
  const totalGrams = getWeightInGrams(quantity, unit, item.size);

  return {
    ...baseNutrition,
    quantity,
    unit,
    size: item.size || null,
    totalGrams,
    source: "usda",
    confidence: "medium",
    matchedFoodName: item.foodName,
    estimateModifiers: [],
  };
};

const getModifier = (item) => {
  const text = normalizeText(
    `${item.foodName || ""} ${item.cookingStyle || ""} ${item.modifier || ""}`
  );

  let multiplier = 1;
  let extraCalories = 0;
  const labels = [];

  if (text.includes("less oil")) {
    multiplier *= 0.9;
    labels.push("less_oil");
  }

  if (text.includes("extra oil") || text.includes("oily")) {
    multiplier *= 1.2;
    labels.push("extra_oil");
  }

  if (text.includes("restaurant") || text.includes("hotel") || text.includes("dhaba")) {
    multiplier *= 1.35;
    labels.push("restaurant");
  }

  if (text.includes("fried") || text.includes("deep fried")) {
    multiplier *= 1.45;
    labels.push("fried");
  }

  if (text.includes("ghee") || text.includes("butter")) {
    extraCalories += 45;
    labels.push("ghee_or_butter");
  }

  return {
    multiplier,
    extraCalories,
    labels,
  };
};

const applyModifier = (nutrition, modifier) => {
  const adjusted = {
    calories: nutrition.calories * modifier.multiplier + modifier.extraCalories,
    protein: nutrition.protein * modifier.multiplier,
    carbs: nutrition.carbs * modifier.multiplier,
    fat: nutrition.fat * modifier.multiplier,
  };

  return {
    calories: Math.round(adjusted.calories),
    protein: Number(adjusted.protein.toFixed(1)),
    carbs: Number(adjusted.carbs.toFixed(1)),
    fat: Number(adjusted.fat.toFixed(1)),
  };
};

const buildEstimate = ({ item, match, source, confidence }) => {
  const unit = normalizeUnit(item.unit);
  const quantity = Number(item.quantity);
  const size = item.size || null;
  const pieceWeight = match.pieceWeight?.[getSize(size)] || null;
  const totalGrams = getWeightInGrams(quantity, unit, size, pieceWeight);
  const baseNutrition = convertMacros(match.nutritionPer100g, quantity, unit, size, pieceWeight);
  const modifier = getModifier(item);
  const nutrition = applyModifier(baseNutrition, modifier);

  return {
    ...nutrition,
    quantity,
    unit,
    size,
    totalGrams,
    source,
    confidence,
    matchedFoodName: match.key,
    estimateModifiers: modifier.labels,
  };
};

export const estimateFoodNutrition = async (item) => {
  if (!item.foodName) {
    throw new Error("foodName is required");
  }

  const quantity = Number(item.quantity);
  if (!quantity || Number.isNaN(quantity) || quantity <= 0) {
    throw new Error("quantity must be a positive number");
  }

  if (shouldPreferUsdaBeforeCookedDb(item.foodName) && isSimpleUsdaFood(item.foodName)) {
    return buildUsdaEstimate(item);
  }

  const cookedMatch = findCookedFood(item.foodName);
  if (cookedMatch) {
    return buildEstimate({
      item,
      match: cookedMatch,
      source: "local_cooked_db",
      confidence: "high",
    });
  }

  const categoryMatch = findCategoryEstimate(item.foodName, item.category);
  if (categoryMatch) {
    return buildEstimate({
      item,
      match: categoryMatch,
      source: "category_estimate",
      confidence: "medium",
    });
  }

  if (isSimpleUsdaFood(item.foodName)) {
    return buildUsdaEstimate(item);
  }

  const fallback = categoryEstimates.find((category) => category.key === "dry_veg_sabji");

  return buildEstimate({
    item,
    match: fallback,
    source: "generic_indian_estimate",
    confidence: "low",
  });
};
