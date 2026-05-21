import Groq from "groq-sdk"

export const parseFoodText = async (text) => {

    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    })

    const prompt = `
Analyze the text and extract the foods consumed. 
For Indian foods often eaten as cooked meals (e.g., "paneer", "chicken", "dal"), infer if they mean the cooked version based on context (like units "bowl") and specify the cooked dish string in foodName (e.g. "paneer curry", "dal makhani") to help USDA search find the most accurate match.
Also detect cooking style words such as less oil, extra oil, fried, restaurant, ghee, or butter.

Return ONLY JSON array strings without markdown blocks.

Format:
[
  { 
    "foodName": "string", 
    "quantity": number,
    "unit": "gm" | "bowl" | "piece" | "katori" | "ounce",
    "size": "small" | "medium" | "large" | null,
    "cookingStyle": "less oil" | "extra oil" | "fried" | "restaurant" | "ghee" | "butter" | "homemade" | null,
    "category": "dal" | "dry_veg_sabji" | "gravy_veg_sabji" | "potato_sabji" | "paneer_curry" | "chicken_curry" | null
  }
]

Rules:
- Units: "katori" is a small Indian bowl (approx 150ml). "bowl" is a standard large bowl (approx 250ml). Keep them distinct.
- Conversions: "glass", "cup" -> "bowl". "pc", "slice" -> "piece". "grams", "g" -> "gm". "oz" -> "ounce".
- If unit is "piece", guess the size ("small", "medium", "large") or default "medium". If not piece, size is null.
- If unit is unspecified, infer logical unit (e.g. Rice -> katori, Apple -> piece).
- If cooking style is not mentioned, use null.
- If the dish is an unknown Indian sabji/curry, choose the closest category.

Input:
"${text}"
`

    const message = await groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2
    })

    const output = message.choices[0].message.content

    const clean = output.replace(/```json|```/g, "").trim()

    return JSON.parse(clean)
}
