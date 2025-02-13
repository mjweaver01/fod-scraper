import { Router, Request, Response } from 'express'
const router = Router()

router.post('/', async (req: Request, res: Response) => {
  const { password } = req.body

  if (password === process.env.AUTH_SECRET) {
    // @TODO: Implement saving logic to your database
    return res.json({
      code: 200,
      message: 'Saved to db',
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
