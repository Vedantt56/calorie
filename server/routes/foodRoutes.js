import express from "express"
import { logFood, logFoodFromText } from "../controllers/foodController.js"

const router = express.Router()

router.post("/log", logFood)
router.post("/log-text", logFoodFromText)

export default router