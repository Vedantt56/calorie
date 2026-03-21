import axios from "axios"  
export const getNutritionFromUSDA = async (foodName) => {
    try {
        const res = await axios.get("https://api.nal.usda.gov/fdc/v1/foods/search", {
            params: {
                query: foodName,
                api_key: process.env.USDA_API_KEY
            }
        })

        if (!res.data.foods || res.data.foods.length === 0) {
            throw new Error("Food not found")
        }

        const food = res.data.foods[0]

        const nutrients = food.foodNutrients || []

        
        const getByNumber = (num) => {
            const nutrient = nutrients.find(n => n.nutrientNumber === num)
            return nutrient ? nutrient.value : 0
        }

        return {
            calories: getByNumber("208"),
            protein: getByNumber("203"),
            fat: getByNumber("204"),
            carbs: getByNumber("205")
        }

    } catch (error) {
        console.log("USDA ERROR:", error.message)
        return {
            calories: 100,
            protein: 0,
            fat: 0,
            carbs: 0
        }
    }
}