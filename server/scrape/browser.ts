import { chromium } from 'playwright'

const SBR_CDP = `wss://brd-customer-hl_296cb4bf-zone-scraping_browser1:9w9y976ou153@brd.superproxy.io:9222`
// const browser = await chromium.connectOverCDP(SBR_CDP)

const browser = await chromium.launch({
  headless: false,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

export default browser
