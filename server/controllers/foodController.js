import FoodLog from "../models/FoodLog.js"
import { getNutritionFromUSDA } from "../services/usdaservice.js"
import { parseFoodText } from "../services/aiservices.js"
import { convertMacros } from "../utils/unitmap.js"

const processAndLogFood = async (item, userId) => {
    const { foodName, quantity, unit = 'gm', size = null } = item;
    
    // Fetch from USDA (which is per 100g)
    const nutritionPer100g = await getNutritionFromUSDA(foodName);
    
    // Convert to actual macros based on user's unit
    const finalNutrition = convertMacros(nutritionPer100g, quantity, unit, size);

    const newFood = new FoodLog({
        foodName,
        quantity,
        unit,
        size,
        calories: finalNutrition.calories,
        protein: finalNutrition.protein,
        fat: finalNutrition.fat,
        carbs: finalNutrition.carbs,
        user: userId
    });

    return await newFood.save();
};

export const getLogs = async (req, res) => {
    try {
        const logs = await FoodLog.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const logFoodFromText = async (req, res) => {
    try {
        const { text } = req.body;
        const items = await parseFoodText(text);

        console.log("AI OUTPUT:", items);
        const results = [];

        for (let item of items) {
            if (!item.foodName || !item.quantity || isNaN(item.quantity)) {
                console.log("Invalid item:", item);
                continue;
            }

            try {
                const loggedItem = await processAndLogFood(item, req.user.id);
                results.push(loggedItem);
            } catch (err) {
                console.log(`Error logging ${item.foodName}:`, err.message);
                results.push({ foodName: item.foodName, error: err.message });
            }
        }

        return res.json({
            message: "Food logged from text",
            data: results
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

export const logFood = async (req, res) => {
    try {
        const loggedItem = await processAndLogFood(req.body, req.user.id);

        res.json({
            message: "Food logged",
            data: loggedItem
        });

    } catch (error) {
        console.log("ERROR:", error.message);
        res.status(500).json({
            message: error.message
        });
    }
}

export const deleteLog = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await FoodLog.findById(id);

        if (!log) {
            return res.status(404).json({ message: "Log not found" });
        }

        // Check ownership
        if (log.user.toString() !== req.user.id) {
            return res.status(401).json({ message: "User not authorized" });
        }

        await log.deleteOne();
        res.json({ message: "Log deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
