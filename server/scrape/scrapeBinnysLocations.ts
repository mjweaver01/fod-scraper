import browser from './browser'

const URL = 'https://www.binnys.com/store-locator/'

export default async function scrapeBinnysLocations() {
  // Open a new Puppeteer page.
  const page = await browser.newPage()

  // Navigate to the URL and wait until network activity slows.
  await page.goto(URL, { waitUntil: 'networkidle2' })

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
