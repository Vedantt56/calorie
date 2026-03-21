import mongoose from "mongoose"

const foodLogSchema = new mongoose.Schema({

    foodName:{
        type:String,
        required:true
    },

    calories:{
        type:Number,
        required:true
    },

    createdAt:{
        type:Date,
        default:Date.now
    }

})

export default mongoose.model("FoodLog", foodLogSchema)