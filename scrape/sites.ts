import scrapeBinnys from './scrapeBinnys'
import scrapeBigRed from './scrapeBigRed'

export default [
  {
    name: 'Small Batch - Binnys',
    url: 'https://www.binnys.com/spirits/whiskey/field-of-dreams-small-batch-bourbon-160342/',
    scraper: scrapeBinnys,
  },
  {
    name: 'Small Batch - Big Red',
    url: 'https://bigredliquors.com/shop/product/field-of-dreams-small-batch-bourbon-whiskey/670fdbe1d76d41428066111b',
    scraper: scrapeBigRed,
  },
  {
    name: 'Players Series - Big Red',
    url: 'https://bigredliquors.com/shop/product/field-of-dreams-player-series-bourbon/647eb382b132754f051df543',
    scraper: scrapeBigRed,
  },
]
