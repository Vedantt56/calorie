import express from "express"
import { logFood, logFoodFromText, getLogs, deleteLog } from "../controllers/foodController.js"
import authMiddleware from "../middleware/authMiddleware.js"
import { validateLogFood, validateLogFoodText } from "../middleware/validation.js"
import { logTextLimiter } from "../middleware/rateLimiter.js"

const router = express.Router()

router.use(authMiddleware)

router.get("/log", getLogs)
router.post("/log", validateLogFood, logFood)
router.post("/log-text", logTextLimiter, validateLogFoodText, logFoodFromText)
router.delete("/log/:id", deleteLog)

export default router