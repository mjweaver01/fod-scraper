import browser from './browser'

export default async function scrapeBigRed(url: string) {
  try {
    const page = await browser.newPage()

    // Optional: Capture console logs from the page context
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))

    console.log('Navigating to:', url)
    await page.goto(url, { waitUntil: 'networkidle0' })
    console.log('Page loaded')

    await page.evaluate(async () => {
      // Small delay to give time for any lazy-loaded content
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const target = document.querySelector('.product-availability-container a b')
      target?.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
        }),
      )
    })

    // Small delay to give time for any lazy-loaded content
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Wait for the <ul> element to be fully loaded before scraping data
    await page.waitForSelector('ul.ch-availability-item', { timeout: 10000 })

    // Extract the data from the updated list structure
    const data = await page.evaluate(async () => {
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
          store: merchantNameElem ? merchantNameElem.textContent.trim().replace(/:$/, '') : '',
          price: priceElem ? priceElem.textContent.trim() : '',
          distance: distanceElem ? distanceElem.textContent.trim() : '',
          quantity: quantityElem ? quantityElem.textContent.trim() : '',
          stock_status: quantityElem.textContent.trim().includes('0') ? 'Out of Stock' : 'In Stock',
          address: addressElem ? addressElem.textContent.trim() : '',
        }
      })
    })

    return data
  } catch (error) {
    console.error('Scraping error:', error)
    throw error
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
