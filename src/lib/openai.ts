import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Guardrails: Never fabricate dish details
export const OPENAI_GUARDRAILS = {
  // Only summarize existing community reviews
  summarizeReviews: (reviews: string[]) => {
    if (reviews.length === 0) {
      return "Be the first to add a tip!"
    }
    return `Summarize these existing reviews in 2-3 sentences, focusing on common themes. Never invent facts: ${reviews.join(' ')}`
  },
  
  // Only generate tags from existing text
  generateTags: (text: string) => {
    return `Extract relevant food tags from this existing text. Only use tags that are explicitly mentioned or strongly implied. Never invent tags: ${text}`
  }
}
