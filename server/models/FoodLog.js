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
    unit: {
        type: String,
        enum: ['gm', 'cup', 'bowl', 'piece', 'katori'],
        default: 'gm'
    },
    size: {
        type: String,
        enum: ['small', 'medium', 'large', null],
        default: null
    },
    calories: {
        type: Number,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

})

export default mongoose.model("FoodLog", foodLogSchema)
