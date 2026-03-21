import mongoose from "mongoose"

const foodLogSchema = new mongoose.Schema({

    foodName: {
        type: String,
        required: true
    },
    protein: {
        type: Number
    },

    fat: {
        type: Number
    },
    carbs: {
        type: Number
    },

    quantity: {
        type: Number,
        required: true
    },
    calories: {
        type: Number,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

})

export default mongoose.model("FoodLog", foodLogSchema)