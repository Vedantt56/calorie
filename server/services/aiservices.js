import OpenAI from "openai"

export const parseFoodText = async (text) => {

    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    })

    const response = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
            {
                role: "system",
                content: "Convert food description into JSON array with foodName and quantity."
            },
            {
                role: "user",
                content: `Convert this into JSON:
                "${text}"

                Format:
                [
                  { "foodName": "", "quantity": number }
                ]`
            }
        ]
    })

    const output = response.choices[0].message.content

    const clean = output.replace(/```json|```/g, "").trim()

    return JSON.parse(clean)
}