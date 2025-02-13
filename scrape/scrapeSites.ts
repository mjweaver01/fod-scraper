import dotenv from 'dotenv'
import sites from './sites'

dotenv.config()

export default async function scrapeSites() {
  const results = []

  for (const site of sites) {
    const data = await site.scraper(site.url)
    results.push({
      name: site.name,
      url: site.url,
      data: data,
    })
  }
  return { results }
}
