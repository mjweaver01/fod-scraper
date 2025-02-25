import binnysLocations from './binnysLocations'
import { userAgent } from '../constants'
import browser from './browser'

export default async function scrapeBinnys(url: string) {
  try {
    const context = await browser.newContext({
      userAgent,
      viewport: { width: 1920, height: 1080 },
    })
    const page = await context.newPage()

    console.log('Navigating to:', url)
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    console.log('Page loaded')

    // Click to trigger data load
    await page.click('#pdp-above-fold .js-store-selector', { timeout: 60000 })

    // Wait for the table to be fully loaded
    await page.waitForSelector('.store-list table tbody tr', { timeout: 60000 })

    // Use Playwright's element handles to extract data
    const rows = await page.$$('.store-list table tbody tr')
    const data = [] as any[]

    console.log('Evaluating & extracting data')

    for (const row of rows) {
      const storeElem = await row.$('td:first-of-type a')
      const phoneElem = await row.$('td:nth-of-type(2)')
      const stockStatusElem = await row.$('td:nth-of-type(3)')

      const store = storeElem ? await storeElem.textContent() : ''
      const phone = phoneElem ? await phoneElem.textContent() : ''
      const stockStatus = stockStatusElem ? await stockStatusElem.textContent() : ''

      const location = binnysLocations.find((l) => store?.trim()?.includes(l.name))
      const address = location
        ? `${location.addressLine1} ${location.city}, ${location.state} ${location.zipCode}`
        : ''

      if (store && !store.includes('Ship to Me') && phone && stockStatus) {
        data.push({
          store: store?.trim() || '',
          phone: phone?.trim() || '',
          stock_status: stockStatus?.trim() || '',
          address: address || '',
          in_stock: stockStatus.includes('In Stock') || stockStatus.includes('Left'),
        })
      }
    }

    console.log(`Data extracted, found ${data.length} items`)

    await browser.close()
    return data
  } catch (error) {
    console.error('Scraping error:', error)
    throw error
  }
}
