import browser from './browser'

export default async function scrapeBinnys(url: string) {
  try {
    const page = await browser.newPage()

    // Optional: Capture console logs from the page context
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))

    console.log('Navigating to:', url)
    await page.goto(url, { waitUntil: 'networkidle0' })
    console.log('Page loaded')

    // Wait for the <ul> element to be fully loaded before scraping data
    await page.waitForSelector('.js-store-selector', { timeout: 10000 })

    // Extract the data from the table
    const data = await page.evaluate(async () => {
      const target = document.querySelector('.js-store-selector')
      target?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, view: window }),
      )
      // await wait for a second
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
