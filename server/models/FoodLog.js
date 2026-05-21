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
        enum: ['gm', 'bowl', 'piece', 'katori', 'ounce'],
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
    totalGrams: {
        type: Number
    },
    source: {
        type: String,
        enum: ['local_cooked_db', 'category_estimate', 'generic_indian_estimate', 'usda', null],
        default: null
    },
    confidence: {
        type: String,
        enum: ['high', 'medium', 'low', null],
        default: null
    },
    matchedFoodName: {
        type: String
    },
    estimateModifiers: [{
        type: String
    }],
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
