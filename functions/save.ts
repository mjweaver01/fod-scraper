import type { Context } from '@netlify/functions'

export default async (req: Request, context: Context) => {
  const { password } = await req.json()

  if (password === process.env.AUTH_SECRET) {
    // @TODO save to db

    return Response.json({
      code: 200,
      message: 'Saved to db',
      error: false,
    })
  } else {
    return Response.json({
      code: 401,
      message: 'Unauthorized',
      error: true,
    })
  }
}
