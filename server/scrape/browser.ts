import puppeteerCore from 'puppeteer-core'
import puppeteer from 'puppeteer'
import chromium from '@sparticuz/chromium'

// Configure Sparticuz/chromium settings for serverless platforms.
chromium.setHeadlessMode = true
chromium.setGraphicsMode = false

let browser: any

if (process.platform === 'linux') {
  console.log('Using Sparticuz/chromium on a Linux serverless environment.')

  // Use a custom executable (if provided) or retrieve one from Sparticuz.
  const executablePath = process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath)
  if (!executablePath) {
    throw new Error('Chromium executable not found.')
  }

  browser = await puppeteerCore.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
  })
} else if (process.platform === 'darwin') {
  console.log('Using macOS configuration for Chrome.')
  browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1024,768',
    ],
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

export default browser
