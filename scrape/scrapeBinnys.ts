import chromium from 'chrome-aws-lambda'
import puppeteerCore from 'puppeteer-core'
import puppeteer from 'puppeteer'

export default async function scrapeBinnys(url: string) {
  let browser

  try {
    if (process.platform === 'linux') {
      console.log('Using Linux configuration for Chromium.')
      const executablePath = await chromium.executablePath
      if (!executablePath) {
        throw new Error('Chromium executable not found.')
      }
      browser = await puppeteerCore.launch({
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: true,
      })
    } else if (process.platform === 'darwin') {
      console.log('Using macOS configuration for Chrome.')
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        ignoreDefaultArgs: ['--disable-extensions'],
      })
    } else {
      console.log('Using default puppeteer launch configuration.')
      browser = await puppeteer.launch({ headless: true })
    }

    const page = await browser.newPage()
    console.log('Navigating to:', url)
    await page.goto(url, { waitUntil: 'networkidle0' })
    console.log('Page loaded')

    const data = await page.evaluate(() => {
      // Optionally click the element that reveals the store list
      const stockElement = document.querySelector('a[data-target="#store-selector-modal"]')
      if (stockElement) {
        console.log('Clicking stock element')
        ;(stockElement as HTMLElement).click()
      }

      const table = document.querySelector('.store-list table')
      if (!table) return []

      console.log('Table found, pulling data')
      const rows = Array.from(table.querySelectorAll('tbody tr'))
      return rows.map((row) => {
        const cells = row.querySelectorAll('td')
        return {
          store: cells[0]?.textContent?.trim() || '',
          phone: cells[1]?.textContent?.trim() || '',
          stock_status: cells[2]?.textContent?.trim() || '',
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
