import { OpenAI } from "openai"

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function embedText(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "openai/text-embedding-ada-002",
    input: text,
  })
  return response.data[0].embedding
}