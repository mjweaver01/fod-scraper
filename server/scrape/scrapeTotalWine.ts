import { chromium } from 'playwright'

export default async function scrapeTotalWine(url: string) {
  try {
    const browser = await chromium.launch({
      // headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.3',
      viewport: { width: 1920, height: 1080 },
    })
    const page = await context.newPage()

    console.log('Navigating to:', url)
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    console.log('Page loaded')

    // hide cookie banner
    if (await page.$('.onetrust-close-btn-handler')) {
      await page.click('.onetrust-close-btn-handler', { timeout: 60000 })
      console.log('Cookie banner hidden')
    }

    // Click on the element to load the dynamic content
    await page.click('div[class*="shoppingOptionsButtonContainer"] button', { timeout: 60000 })

    await page.waitForSelector('button[anclick="change_store_modal_view_all"]', { timeout: 60000 })

    // Use Playwright's element handles to extract data
    const items = await page.$$('ul.nearbyStoresList__j0Ub7aP6 li')
    const data = [] as any[]

    console.log('Evaluating & extracting data')

    for (const item of items) {
      const merchantNameElem = await item.$('h3[data-at="nearby-stores-storeName-text"]')
      const addressElems = await item.$$('div[data-at="nearby-stores-storeAddress-text"] > div')
      const phoneElem = await item.$('div[data-at="nearby-stores-storePhoneNumber-text"]')
      const distanceElem = await item.$('div > div[data-at="nearby-stores-storeDistance-text"]')
      const stockStatusElem = await item.$('div[data-at="nearby-stores-InStock-text"]')

      const store = merchantNameElem ? await merchantNameElem.textContent() : ''
      const address =
        addressElems.length > 0
          ? (await Promise.all(addressElems.map((elem) => elem.textContent()))).join(', ')
          : ''
      const phone = phoneElem ? await phoneElem.textContent() : ''
      const distance = distanceElem ? await distanceElem.textContent() : ''
      const stock_status = stockStatusElem ? await stockStatusElem.textContent() : 'Out of Stock'
      const in_stock = stock_status === 'In Stock'

      data.push({
        store: store?.trim() || '',
        address: address?.trim() || '',
        phone: phone?.trim() || '',
        distance: distance?.trim() || '',
        stock_status: stock_status || '',
        in_stock: in_stock || false,
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
