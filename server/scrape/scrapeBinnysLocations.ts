import { userAgent } from '../constants'
import browser from './browser'
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
  const context = await browser.newContext({
    userAgent,
    viewport: { width: 1920, height: 1080 },
  })
  const page = await context.newPage()

  console.log('Navigating to:', URL)
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  console.log('Page loaded')

  // Ensure that the serverSideModel is defined in the page context.
  await page.waitForFunction(() => !!window.serverSideModel)

  // Evaluate the page to extract the storesGroupedByState property.
  const storesGroupedByState = await page.evaluate(() => {
    return window.serverSideModel?.storesGroupedByState || null
  })

  // Clean up by closing the browser.
  await browser.close()

  if (!storesGroupedByState) {
    throw new Error('storesGroupedByState not found on the page')
  }

  return storesGroupedByState
}
