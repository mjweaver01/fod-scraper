import dotenv from 'dotenv'
import scrapeBinnys from './scrapeBinnys'

dotenv.config()

export default async function scrapeSites() {
  const binnysData = await scrapeBinnys(process.env.BINNYS_URL)

  console.log(binnysData)

  return {
    binnysData,
  }
}
