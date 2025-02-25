import { chromium } from 'playwright'

const SBR_CDP = `wss://brd-customer-hl_296cb4bf-zone-scraping_browser1:9w9y976ou153@brd.superproxy.io:9222`
// const newBrowser = async () => await chromium.connectOverCDP(SBR_CDP)

const newBrowser = async () =>
  await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

export default newBrowser
