import express from "express"
import { logFood } from "../controllers/foodController.js"

const router = express.Router()

router.post("/log", logFood)

export default router