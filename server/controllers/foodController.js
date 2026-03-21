import FoodLog from "../models/FoodLog.js"
export const logFood = async (req,res) => {

    try {

        const { foodName, calories } = req.body

        const newFood=new FoodLog({
            foodName,
            calories
        })
        await newFood.save();
        res.json({
            message: "Food logged",
            "data":newFood

            
        })

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        })

    }

}