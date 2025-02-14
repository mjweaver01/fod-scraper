import { getBrowser } from './browser'

export default async function scrapeBigRed(url: string) {
  try {
    const browser = await getBrowser()
    const page = await browser.newPage()

    // Use a custom user agent to mimic a standard (or even mobile) browser.
    // This helps bypass websites that block scrapers by inspecting headers.
    const userAgent =
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.3'
    await page.setUserAgent(userAgent)

    console.log('Navigating to:', url)
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    console.log('Page loaded')

    // Wait for the clickable element to be available before triggering the event
    await page.waitForSelector('.product-availability-container a b', { timeout: 10000 })

    // Trigger a click on the element to load the dynamic content
    await page.evaluate(async () => {
      // Small delay to allow any lazy-loaded content to initialize.
      await new Promise((resolve) => setTimeout(resolve, 500))
      const target = document.querySelector('.product-availability-container a b')
      if (target) {
        target.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
          }),
        )
      }
    })

    // Wait for the <ul> element containing the data to be fully loaded.
    await page.waitForSelector('ul.ch-availability-item', { timeout: 10000 })

    // Extract the data from the updated list structure.
    const data = await page.evaluate(() => {
      const itemsList = document.querySelector('ul.ch-availability-item')
      if (!itemsList) return []
      const items = Array.from(itemsList.querySelectorAll('li.ch-result-unit'))
      return items.map((item) => {
        const merchantNameElem = item.querySelector(
          'div.ch-location-details > div.ch-merchant-name',
        )
        const priceElem = item.querySelector('div.ch-location-details > div.ch-price-unit')
        const distanceElem = item.querySelector('small.ch-location-wrapper > span.ch-distance')
        const quantityElem = item.querySelector('small.ch-location-wrapper > span.ch-quantity')
        const addressElem = item.querySelector('small.ch-location-wrapper > span.ch-address')

        return {
          store: merchantNameElem ? merchantNameElem?.textContent?.trim().replace(/:$/, '') : '',
          price: priceElem ? priceElem.textContent?.trim() : '',
          distance: distanceElem ? distanceElem.textContent?.trim() : '',
          quantity: quantityElem ? quantityElem.textContent?.trim() : '',
          stock_status:
            quantityElem && quantityElem.textContent?.trim().includes('0')
              ? 'Out of Stock'
              : 'In Stock',
          in_stock: quantityElem && quantityElem.textContent?.trim().includes('0') ? false : true,
          address: addressElem ? addressElem.textContent?.trim() : '',
        }
      })
    })

    await page.close()
    return data
  } catch (error) {
    console.error('Scraping error:', error)
    throw error
  }
}
