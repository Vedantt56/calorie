import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db.js"

dotenv.config({ override: true })

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set')
  process.exit(1)
}

const app = express()

// connect database
connectDB()

// middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

// routes
import foodRoutes from "./routes/foodRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import { globalLimiter } from "./middleware/rateLimiter.js"

app.use(globalLimiter)
app.use("/api/food", foodRoutes)
app.use("/api/auth", authRoutes)

// test route
app.get("/", (req,res)=>{
    res.send("API running")
})

const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})
// console.log("KEY:", process.env.GEMINI_API_KEY)
