import Groq from "groq-sdk"

export const parseFoodText = async (text) => {

    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    })

    const prompt = `
Return ONLY JSON array.

Format:
[
  { "foodName": "", "quantity": number }
]

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