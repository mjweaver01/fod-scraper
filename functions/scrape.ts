import type { Context } from '@netlify/functions'
import scrapeSites from '../scrape/scrapeSites'

export default async (req: Request, context: Context) => {
  const { password } = await req.json()

  if (password === process.env.AUTH_SECRET) {
    // @TODO SCRAPE
    const results = await scrapeSites()

    return Response.json({
      code: 200,
      message: 'Authorized',
      error: false,
      data: results,
    })
  } else {
    return Response.json({
      code: 401,
      message: 'Unauthorized',
      error: true,
    })
  }
}
