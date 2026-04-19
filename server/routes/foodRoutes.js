import express from "express"
import { logFood, logFoodFromText, getLogs, deleteLog } from "../controllers/foodController.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

router.use(authMiddleware)

router.get("/log", getLogs)
router.post("/log", logFood)
router.post("/log-text", logFoodFromText)
router.delete("/log/:id", deleteLog)

export default router