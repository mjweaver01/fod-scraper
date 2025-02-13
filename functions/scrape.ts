import type { Context } from '@netlify/functions'
import scrapeBinnys from '../scrape/scrapeBinnys'
import scrapeBigRed from '../scrape/scrapeBigRed'

export default async (req: Request, context: Context) => {
  const { password, page } = await req.json()
  const { url, scraper } = page

  const scrapeClients = {
    binnys: scrapeBinnys,
    bigred: scrapeBigRed,
  }

  if (password === process.env.AUTH_SECRET) {
    const result = await scrapeClients[scraper](url)

    return Response.json({
      code: 200,
      message: 'Authorized',
      error: false,
      data: result,
    })
  } else {
    return Response.json({
      code: 401,
      message: 'Unauthorized',
      error: true,
    })
  }
}
