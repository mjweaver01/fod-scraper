import { getBrowser } from './browser'

// Extend the global Window interface to include serverSideModel.
declare global {
  interface Window {
    serverSideModel: {
      // Change this to a more specific type if available.
      storesGroupedByState: any
    }
  }
}

const URL = 'https://www.binnys.com/store-locator/'

export default async function scrapeBinnysLocations() {
  // Open a new Puppeteer page.
  const browser = await getBrowser()
  const page = await browser.newPage()

  // Navigate to the URL and wait until network activity stops.
  await page.goto(URL, { waitUntil: 'networkidle0' })

  // Ensure that the serverSideModel is defined in the page context.
  await page.waitForFunction(() => !!window.serverSideModel)

  // Evaluate the page to extract the storesGroupedByState property.
  const storesGroupedByState = await page.evaluate(() => {
    return window.serverSideModel?.storesGroupedByState || null
  })

  // Clean up by closing the page.
  await page.close()

  if (!storesGroupedByState) {
    throw new Error('storesGroupedByState not found on the page')
  }

  return storesGroupedByState
}
