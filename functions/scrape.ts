import type { Context } from '@netlify/functions'
import scrapeBinnys from '../server/scrape/scrapeBinnys'
import scrapeBigRed from '../server/scrape/scrapeBigRed'

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
      url,
      name: page.name,
      data: result,
      time: new Date().toISOString(),
    })
  } else {
    return Response.json({
      code: 401,
      message: 'Unauthorized',
      error: true,
    })
  }
}
