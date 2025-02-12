import dotenv from 'dotenv'
import scrapeBinnys from './scrapeBinnys'

dotenv.config()

const sites = [
  {
    name: 'FOD Small Batch - Binnys',
    url: 'https://www.binnys.com/spirits/whiskey/field-of-dreams-small-batch-bourbon-160342/',
    scraper: scrapeBinnys,
  },
]

export default async function scrapeSites() {
  const results = []

  for (const site of sites) {
    const data = await site.scraper(site.url)
    results.push(data)
  }

  console.log(results)

  return {
    results: results.flat(),
  }
}
