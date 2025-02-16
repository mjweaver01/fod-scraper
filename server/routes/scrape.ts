import { Router, Request, Response } from 'express'
import scrapeBinnys from '../scrape/scrapeBinnys'
import scrapeBigRed from '../scrape/scrapeBigRed'
import scrapeTotalWine from '../scrape/scrapeTotalWine'
import scrapeLiquorBarn from '../scrape/scrapeLiquorBarn'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
  const { password, page } = req.body
  const { url, scraper, name } = page

  const scrapeClients: { [key: string]: any } = {
    binnys: scrapeBinnys,
    bigred: scrapeBigRed,
    totalwine: scrapeTotalWine,
    liquorbarn: scrapeLiquorBarn,
  }

  if (password === process.env.AUTH_SECRET) {
    try {
      const result = await scrapeClients[scraper](url)
      return res.json({
        code: 200,
        message: 'Authorized',
        error: false,
        url,
        name,
        data: result,
        time: new Date().toISOString(),
      })
    } catch (error: any) {
      console.error('Scraping error:', error)
      return res.status(500).json({
        code: 500,
        message: 'Scraping error: ' + error.message,
        error: true,
      })
    }
  } else {
    return res.status(401).json({
      code: 401,
      message: 'Unauthorized',
      error: true,
    })
  }
})

export default router
