export const getWeightInGrams = (quantity, unit, size) => {
    let weightInGrams = quantity;

    switch (unit?.toLowerCase()) {
        case 'gm':
            weightInGrams = quantity;
            break;
        case 'cup':
            // Standard Indian steel glass/cup
            weightInGrams = quantity * 200;
            break;
        case 'bowl':
            // Standard large bowl
            weightInGrams = quantity * 250;
            break;
        case 'katori':
            // Indian Katori (smaller)
            weightInGrams = quantity * 150;
            break;
        case 'piece':
            // Size mapping for pieces
            if (size === 'small') weightInGrams = quantity * 50;
            else if (size === 'large') weightInGrams = quantity * 150;
            else weightInGrams = quantity * 100; // medium by default
            break;
        default:
            weightInGrams = quantity;
    }
    
    return weightInGrams;
};

export const convertMacros = (nutritionPer100g, quantity, unit, size) => {
    const totalGrams = getWeightInGrams(quantity, unit, size);
    const multiplier = totalGrams / 100;

    return {
        calories: Math.round(nutritionPer100g.calories * multiplier),
        protein: Math.round(nutritionPer100g.protein * multiplier),
        fat: Math.round(nutritionPer100g.fat * multiplier),
        carbs: Math.round(nutritionPer100g.carbs * multiplier)
    };
};
