export const normalizeUnit = (unit = 'gm') => {
    const normalized = String(unit).toLowerCase().trim();

    if (['g', 'gram', 'grams', 'gm'].includes(normalized)) return 'gm';
    if (['oz', 'ounce', 'ounces'].includes(normalized)) return 'ounce';
    if (['pc', 'pcs', 'piece', 'pieces', 'slice', 'slices'].includes(normalized)) return 'piece';
    if (['katori', 'katoris'].includes(normalized)) return 'katori';
    if (['bowl', 'bowls', 'cup', 'cups', 'glass', 'glasses'].includes(normalized)) return 'bowl';

    return 'gm';
};

export const getWeightInGrams = (quantity, unit, size, pieceWeight = null) => {
    const normalizedUnit = normalizeUnit(unit);
    let weightInGrams = Number(quantity);

    switch (normalizedUnit) {
        case 'gm':
            weightInGrams = Number(quantity);
            break;
        case 'ounce':
            weightInGrams = Number(quantity) * 28.35;
            break;
        case 'bowl':
            // Standard large bowl
            weightInGrams = Number(quantity) * 250;
            break;
        case 'katori':
            // Indian Katori (smaller)
            weightInGrams = Number(quantity) * 150;
            break;
        case 'piece':
            if (pieceWeight) {
                weightInGrams = Number(quantity) * pieceWeight;
            } else if (size === 'small') {
                weightInGrams = Number(quantity) * 50;
            } else if (size === 'large') {
                weightInGrams = Number(quantity) * 150;
            } else {
                weightInGrams = Number(quantity) * 100;
            }
            break;
        default:
            weightInGrams = Number(quantity);
    }
    
    return Number(weightInGrams.toFixed(1));
};

export const convertMacros = (nutritionPer100g, quantity, unit, size, pieceWeight = null) => {
    const totalGrams = getWeightInGrams(quantity, unit, size, pieceWeight);
    const multiplier = totalGrams / 100;

    return {
        calories: Math.round(nutritionPer100g.calories * multiplier),
        protein: Number((nutritionPer100g.protein * multiplier).toFixed(1)),
        fat: Number((nutritionPer100g.fat * multiplier).toFixed(1)),
        carbs: Number((nutritionPer100g.carbs * multiplier).toFixed(1))
    };
};
