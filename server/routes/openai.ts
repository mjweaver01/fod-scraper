import dotenv from 'dotenv'
import { Router, Request, Response } from 'express'
import OpenAI from 'openai'

dotenv.config()
const router = Router()

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

router.post('/stream', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // Create a completion request with streaming enabled
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      stream: true,
    })

    // Stream the response
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      res.write(`data: ${content}\n\n`)
    }

    res.end()
  } catch (error) {
    console.error('Error in /stream route:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router
