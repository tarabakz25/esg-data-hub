import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function embedText(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "google/gemini-2.0-flash-001",
    input: text,
  })
  return response.data[0].embedding
}