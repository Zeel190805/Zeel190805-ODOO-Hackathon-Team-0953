import { GoogleGenerativeAI } from "@google/generative-ai"
import { GoogleGenerativeAIStream, type Message, StreamingTextResponse } from "ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export const dynamic = "force-dynamic"

// Convert messages from the Vercel AI SDK Format to the format
// that is expected by the Google GenAI SDK
const buildGoogleGenAIPrompt = (messages: Message[]) => {
  const systemPrompt = `You are a helpful AI assistant for a Skill Swap Platform. You help users with:
- Learning new skills and improving existing ones
- Finding the best ways to practice and develop skills
- Understanding skill requirements for different careers
- Providing guidance on skill swapping and teaching
- Answering questions about the platform features

Keep your responses helpful, encouraging, and focused on skill development.`

  const contents = [
    {
      role: "user",
      parts: [{ text: systemPrompt }],
    },
    ...messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
  ]

  return { contents }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!process.env.GEMINI_API_KEY) {
      // Return a mock response when API key is not available
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content:
                  "I'm here to help you with skill development! However, the Gemini API key is not configured. Please add your GEMINI_API_KEY to the environment variables to enable AI responses. In the meantime, I can suggest that you focus on practicing your skills regularly and connecting with other learners in the community.",
              },
            },
          ],
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const geminiStream = await genAI
      .getGenerativeModel({ model: "gemini-pro" })
      .generateContentStream(buildGoogleGenAIPrompt(messages))

    const stream = GoogleGenerativeAIStream(geminiStream)
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error("[CHATBOT_API_ERROR]", error)

    // Return a helpful error response
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content:
                "I apologize, but I'm experiencing some technical difficulties right now. Here are some general tips for skill development:\n\n1. Practice regularly and consistently\n2. Break down complex skills into smaller components\n3. Find a mentor or learning partner\n4. Use online resources and tutorials\n5. Apply your skills to real projects\n\nPlease try again later, and I'll be happy to provide more personalized advice!",
            },
          },
        ],
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
