import FoodLog from "../models/FoodLog.js"
import { getNutritionFromUSDA } from "../services/usdaService.js"

export const logFood = async (req, res) => {
    try {
        const { foodName, quantity } = req.body

        const nutrition = await getNutritionFromUSDA(foodName)

        const newFood = new FoodLog({
            foodName,
            quantity,
            calories: nutrition.protein+nutrition.fat+nutrition.carbs,
            protein: nutrition.protein * quantity,
            fat: nutrition.fat * quantity,
            carbs: nutrition.carbs * quantity
        })

        await newFood.save()

        res.json({
            message: "Food logged",
            data: newFood
        })

    } catch (error) {
        console.log("ERROR:", error.message)

        res.status(500).json({
            message: error.message
        })
    }
}