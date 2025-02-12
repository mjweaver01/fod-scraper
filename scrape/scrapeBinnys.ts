import puppeteer from 'puppeteer'

export default async function scrapeBinnys(url: string) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)

  const data = await page.evaluate(() => {
    // Optionally click the element that reveals the store list
    const stockElement = document.querySelector('a[data-target="#store-selector-modal"]')
    if (stockElement) {
      console.log('Clicking stock element')
      stockElement.click()
    }

    // Select the table within the element that has the class 'store-list'
    const table = document.querySelector('.store-list table')
    if (!table) return []

    console.log('Table found, pulling data')

    // Get all the rows from the table body
    const rows = Array.from(table.querySelectorAll('tbody tr'))
    // Map each row to an object with store, phone number, and stock status values
    return rows.map((row) => {
      const cells = row.querySelectorAll('td')
      return {
        store: cells[0]?.textContent.trim() || '',
        phone: cells[1]?.textContent.trim() || '',
        stock_status: cells[2]?.textContent.trim() || '',
      }
    })
  })

  await browser.close()
  return data
}
