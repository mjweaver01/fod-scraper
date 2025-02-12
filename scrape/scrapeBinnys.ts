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
        executablePath,
        headless: true,
        defaultViewport: {
          width: 1024,
          height: 768,
        },
      })
    } else if (process.platform === 'darwin') {
      console.log('Using macOS configuration for Chrome.')
      browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        ignoreDefaultArgs: ['--disable-extensions'],
        defaultViewport: {
          width: 1024,
          height: 768,
        },
      })
    } else {
      console.log('Using default puppeteer launch configuration.')
      browser = await puppeteer.launch({ headless: true })
    }

    const page = await browser.newPage()

    // Optional: Capture console logs from the page context
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))

    console.log('Navigating to:', url)
    await page.goto(url, { waitUntil: 'networkidle0' })
    console.log('Page loaded')

    // Wait for the stock element to be visible with an increased timeout
    const stockButtonSelector = '.js-store-selector'
    const stockButton = await page.$(stockButtonSelector)
    console.log('stockButton', stockButton)

    if (stockButton) {
      console.log('Stock button found')
      console.log('scroll into view')
      // Scroll element into view for proper interactivity.
      await stockButton.evaluate((btn) => btn.scrollIntoView())
      await new Promise((resolve) => setTimeout(resolve, 500))

      // @TODO FIX
      // Error during elementHandle.click(), falling back to page.mouse.click(): Error: Node is either not clickable or not an Element
      // @TODO FIX

      // First try to click using the element handle.
      try {
        await stockButton.click()
        await stockButton.click()
        console.log('Stock button clicked via elementHandle.click().')
      } catch (err) {
        console.error(
          'Error during elementHandle.click(), falling back to page.mouse.click():',
          err,
        )
        const boundingBox = await stockButton.boundingBox()
        if (boundingBox) {
          await page.mouse.click(
            boundingBox.x + boundingBox.width / 2,
            boundingBox.y + boundingBox.height / 2,
          )
          console.log('Stock button clicked via page.mouse.click().')
        } else {
          throw new Error('Unable to determine bounding box for clickable element.')
        }
      }

      // Optional: wait for the modal to appear after clicking.
      try {
        await page.waitForSelector('#store-selector-modal.show', { timeout: 5000 })
        console.log('Modal is visible after clicking the stock button.')
      } catch (e) {
        console.error('Modal did not appear after the click.')
      }
    } else {
      throw new Error('Stock button not found after waiting.')
    }

    // Continue to wait for the table to appear
    await page.waitForSelector('.store-list table', { timeout: 10000 })
    console.log('Table is visible. Extracting data now...')

    // Extract the data from the table
    const data = await page.evaluate(() => {
      const table = document.querySelector('.store-list table')
      if (!table) return []
      console.log('Table found in evaluate.')
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
