import { getBrowser } from './browser'
import binnysLocations from './binnysLocations'

export default async function scrapeBinnys(url: string) {
  try {
    const browser = await getBrowser()
    const page = await browser.newPage()

    // Use a custom user agent to mimic a mobile browser.
    const userAgent =
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.3'
    await page.setUserAgent(userAgent)
    await page.setViewport({ width: 1280, height: 800 })

    console.log('Navigating to:', url)
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    console.log('Page loaded')

    await page.waitForSelector('.js-store-selector', { timeout: 10000 })

    // Dispatch a click to trigger data load and wait briefly.
    await page.evaluate(() => {
      const target = document.querySelector('.js-store-selector')
      if (target) {
        target.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true, view: window }),
        )
      }
    })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Evaluate the page for the desired data.
    const data = await page.evaluate((locations) => {
      console.log('Evaluating')
      const table = document.querySelector('.store-list table')
      if (!table) return []
      const rows = Array.from(table.querySelectorAll('tbody tr'))
      return rows
        .map((row) => {
          const store = row.querySelector('td:first-of-type a')
          const phone = row.querySelector('td:nth-of-type(2)')
          const stock_status = row.querySelector('td:nth-of-type(3)')
          const location = locations.find((l) => store?.textContent?.trim()?.includes(l.name))
          if (
            store &&
            !store.textContent?.trim()?.includes('Ship to Me') &&
            phone &&
            stock_status
          ) {
            return {
              store: store.textContent?.trim() || '',
              phone: phone.textContent?.trim() || '',
              stock_status: stock_status.textContent?.trim() || '',
              address: `${location?.addressLine1} ${location?.city}, ${location?.state} ${location?.zipCode}`,
              in_stock:
                stock_status.textContent?.trim().includes('In Stock') ||
                stock_status.textContent?.trim().includes('Left'),
            }
          } else {
            return false
          }
        })
        .filter(Boolean)
    }, binnysLocations)

    await page.close()
    return data
  } catch (error) {
    console.error('Scraping error:', error)
    throw error
  }
}
