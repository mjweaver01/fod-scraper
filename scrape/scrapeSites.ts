import dotenv from 'dotenv'
import cron from 'node-cron'
import scrapeBinnys from './scrapeBinnys'

dotenv.config()

export default async function scrapeSites() {
  const binnysData = scrapeBinnys(process.env.BINNYS_URL)

  console.log(binnysData)

  return {
    binnysData,
  }
}
