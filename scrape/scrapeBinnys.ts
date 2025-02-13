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
        ignoreDefaultArgs: ['--disable-extensions'],
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

    await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const target = document.querySelector('.js-store-selector')
      target?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, view: window }),
      )
      // await wait for a second
      await new Promise((resolve) => setTimeout(resolve, 1000))
    })

    // Extract the data from the table
    const data = await page.evaluate(() => {
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
