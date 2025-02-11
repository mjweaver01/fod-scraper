import type { Context } from '@netlify/functions'

export default async (req: Request, context: Context) => {
  const { password } = await req.json()

  if (password === process.env.AUTH_SECRET) {
    // @TODO SCRAPE
    //
    // return Response.json({
    //   code: 200,
    //   message: 'Authorized',
    //   error: false,
    // })
  } else {
    return Response.json({
      code: 401,
      message: 'Unauthorized',
      error: true,
    })
  }
}
