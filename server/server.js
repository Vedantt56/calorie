import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db.js"

dotenv.config()

const app = express()

// connect database
connectDB()

// middleware
app.use(cors())
app.use(express.json())

// routes
import foodRoutes from "./routes/foodRoutes.js"
app.use("/api/food", foodRoutes)

// test route
app.get("/", (req,res)=>{
    res.send("API running")
})

const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})
// console.log("KEY:", process.env.GEMINI_API_KEY)