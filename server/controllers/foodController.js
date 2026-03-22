import FoodLog from "../models/FoodLog.js"
import { getNutritionFromUSDA } from "../services/usdaService.js"
import { parseFoodText } from "../services/aiservices.js"

export const logFoodFromText = async (req, res) => {
    try {
        const { text } = req.body

       const items = await parseFoodText(text)

        console.log("AI OUTPUT:", items)
        const results = []

        for (let item of items) {

             if (!item.foodName || !item.quantity || isNaN(item.quantity)) {
        console.log("Invalid item:", item)
        continue
    }

            const fakeReq = { body: item }

            const fakeRes = {
                json: (data) => results.push(data)
            }

            await logFood(fakeReq, fakeRes)
        }

        return res.json({
            message: "Food logged from text",
            data: results
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}


export const logFood = async (req, res) => {
    try {
        const { foodName, quantity } = req.body

        const nutrition = await getNutritionFromUSDA(foodName)

        const newFood = new FoodLog({
            foodName,
            quantity,
            calories: nutrition.calories * quantity,
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