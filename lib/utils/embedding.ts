import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function embedText(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "gpt-4o-mini-2024-07-18",
    input: text,
  })
  return response.data[0].embedding
}