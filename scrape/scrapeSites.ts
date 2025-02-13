import dotenv from 'dotenv'
import sites from './sites'

dotenv.config()

export default async function scrapeSites() {
  // Create an array of promises for each site scrape
  const scrapeTasks = sites.map((site) =>
    site.scraper(site.url).then((data) => ({
      name: site.name,
      url: site.url,
      data: data,
    })),
  )

  // Await all promises concurrently
  const results = await Promise.all(scrapeTasks)
  return { results }
}
