import dotenv from 'dotenv'
import { Router, Request, Response } from 'express'
import OpenAI from 'openai'
import { prompt } from '../constants'

dotenv.config()
const router = Router()

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

router.post('/stream', async (req: Request, res: Response) => {
  const { question, data, password } = req.body

  if (password !== process.env.AUTH_SECRET) {
    return res.json({
      code: 401,
      message: 'Unauthorized',
      error: true,
    })
  }

  try {
    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // Create a completion request with streaming enabled
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt.replace('{data}', JSON.stringify(data)) },
        { role: 'user', content: question },
      ],
      stream: true,
    })

    // Stream the response
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      res.write(content)
    }

    res.end()
  } catch (error) {
    console.error('Error in /stream route:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router
