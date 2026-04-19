import Groq from "groq-sdk"

export const parseFoodText = async (text) => {

    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    })

    const prompt = `
Analyze the text and extract the foods consumed. 
For Indian foods often eaten as cooked meals (e.g., "paneer", "chicken", "dal"), infer if they mean the cooked version based on context (like units "bowl") and specify the cooked dish string in foodName (e.g. "paneer curry", "dal makhani") to help USDA search find the most accurate match.

Return ONLY JSON array strings without markdown blocks.

Format:
[
  { 
    "foodName": "string", 
    "quantity": number,
    "unit": "gm" | "cup" | "bowl" | "piece" | "katori",
    "size": "small" | "medium" | "large" | null
  }
]

Rules:
- Units: "katori" is a small Indian bowl (approx 150ml). "bowl" is a standard large bowl (approx 250ml). Keep them distinct.
- Conversions: "glass", "cup" -> "cup". "pc", "slice" -> "piece". "grams", "g" -> "gm".
- If unit is "piece", guess the size ("small", "medium", "large") or default "medium". If not piece, size is null.
- If unit is unspecified, infer logical unit (e.g. Rice -> katori, Apple -> piece).

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
