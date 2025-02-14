import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

let browser

export async function getBrowser() {
  if (!browser) {
    puppeteer.use(StealthPlugin())
    browser = await puppeteer.launch({
      headless: true,
      timeout: 60000,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-features=site-per-process',
      ],
    })
  }
  return browser
}
