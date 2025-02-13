import fs from 'fs'
import chromium from 'chrome-aws-lambda'
import puppeteerCore from 'puppeteer-core'
import puppeteer from 'puppeteer'

let browser

if (process.platform === 'linux') {
  console.log('Using Linux configuration for Chromium.')
  const executablePath = await chromium.executablePath
  if (!executablePath) {
    throw new Error('Chromium executable not found.')
  }

  // Copy the Chromium binary from its original location to /tmp.
  const tempExecutablePath = '/tmp/chromium'
  if (!fs.existsSync(tempExecutablePath)) {
    fs.copyFileSync(executablePath, tempExecutablePath)
    fs.chmodSync(tempExecutablePath, 0o755)
  }

  browser = await puppeteerCore.launch({
    args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    ignoreDefaultArgs: ['--disable-extensions'],
    executablePath: tempExecutablePath,
    headless: 'new' as any,
    defaultViewport: {
      width: 1024,
      height: 768,
    },
  })
} else if (process.platform === 'darwin') {
  console.log('Using macOS configuration for Chrome.')
  browser = await puppeteer.launch({
    headless: 'new' as any,
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

export default browser
