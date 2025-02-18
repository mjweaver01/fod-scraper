import { chromium } from 'playwright'
import { userAgent } from '../constants'

export default async function scrapeBigRed(url: string) {
  try {
    const browser = await chromium.launch()
    const context = await browser.newContext({
      userAgent,
      viewport: { width: 1920, height: 1080 },
    })
    const page = await context.newPage()

    console.log('Navigating to:', url)
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    console.log('Page loaded')

    // Click on the element to load the dynamic content
    await page.click('.product-availability-container a b', { timeout: 60000 })

    // Wait for the <ul> element containing the data to be fully loaded.
    await page.waitForSelector('ul.ch-availability-item', { timeout: 60000 })

    // Use Playwright's element handles to extract data
    const items = await page.$$('ul.ch-availability-item li.ch-result-unit')
    const data = [] as any[]

    console.log('Evaluating & extracting data')

    for (const item of items) {
      const merchantNameElem = await item.$('div.ch-location-details > div.ch-merchant-name')
      const priceElem = await item.$('div.ch-location-details > div.ch-price-unit')
      const distanceElem = await item.$('small.ch-location-wrapper > span.ch-distance')
      const quantityElem = await item.$('small.ch-location-wrapper > span.ch-quantity')
      const addressElem = await item.$('small.ch-location-wrapper > span.ch-address')

      const store = merchantNameElem ? await merchantNameElem.textContent() : ''
      const price = priceElem ? await priceElem.textContent() : ''
      const distance = distanceElem ? await distanceElem.textContent() : ''
      const quantity = quantityElem ? await quantityElem.textContent() : ''
      const address = addressElem ? await addressElem.textContent() : ''

      const stock_status = quantity && quantity.includes('0') ? 'Out of Stock' : 'In Stock'
      const in_stock = quantity && !quantity.includes('0')

      data.push({
        store: store?.trim().replace(/:$/, '') || '',
        price: price?.trim() || '',
        distance: distance?.trim() || '',
        quantity: quantity?.trim() || '',
        stock_status: stock_status || '',
        in_stock: in_stock || false,
        address: address?.trim() || '',
      })
    }

    console.log(`Data extracted, found ${data.length} items`)

    await browser.close()
    return data
  } catch (error) {
    console.error('Scraping error:', error)
    throw error
  }
}
