import dotenv from 'dotenv'
import { Router, Request, Response } from 'express'

dotenv.config()
const router = Router()

router.post('/', (req: Request, res: Response) => {
  const { password } = req.body

  if (password === process.env.AUTH_SECRET) {
    return res.json({
      code: 200,
      message: 'Authorized',
      error: false,
    })
  } else {
    return res.status(401).json({
      code: 401,
      message: 'Unauthorized',
      error: true,
    })
  }
})

export default router
