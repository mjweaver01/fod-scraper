import chromium from 'chrome-aws-lambda'
import puppeteerCore from 'puppeteer-core'
import puppeteer from 'puppeteer'

export default async function scrapeBigRed(url: string) {
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

      const target = document.querySelector('.product-availability-container a b')
      target?.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
        }),
      )
      // Wait for a second for any dynamic content to update
      await new Promise((resolve) => setTimeout(resolve, 1000))
    })

    // Extract the data from the updated list structure
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
          store: merchantNameElem ? merchantNameElem.textContent.trim() : '',
          price: priceElem ? priceElem.textContent.trim() : '',
          distance: distanceElem ? distanceElem.textContent.trim() : '',
          quantity: quantityElem ? quantityElem.textContent.trim() : '',
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
