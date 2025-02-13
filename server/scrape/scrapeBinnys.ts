import browser from './browser'

export default async function scrapeBinnys(url: string) {
  try {
    const page = await browser.newPage()

    // Use a custom user agent to mimic a standard (or even mobile) browser.
    // This can help bypass websites that block scrapers by examining headers.
    const userAgent =
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.3'
    await page.setUserAgent(userAgent)

    console.log('Navigating to:', url)
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    console.log('Page loaded')

    // Wait for the element that will trigger the table load.
    await page.waitForSelector('.js-store-selector', { timeout: 10000 })

    // Extract the data from the dynamically loaded table.
    const data = await page.evaluate(async () => {
      const target = document.querySelector('.js-store-selector')
      if (target) {
        target.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true, view: window }),
        )
      }
      // Brief pause to allow data to load
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const table = document.querySelector('.store-list table')
      if (!table) return []
      console.log('Table found in evaluate.')
      const rows = Array.from(table.querySelectorAll('tbody tr'))
      return rows
        .map((row) => {
          const store = row.querySelector('td:first-of-type a')
          const phone = row.querySelector('td:nth-of-type(2)')
          const stock_status = row.querySelector('td:nth-of-type(3)')

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
              in_stock: stock_status.textContent?.trim()?.includes('In Stock') ? true : false,
            }
          } else {
            return false
          }
        })
        .filter(Boolean)
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
