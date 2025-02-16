export const sites = [
  {
    name: 'Small Batch - Binnys',
    url: 'https://www.binnys.com/spirits/whiskey/field-of-dreams-small-batch-bourbon-160342/',
    scraper: 'binnys',
  },
  {
    name: 'Small Batch - Big Red',
    url: 'https://bigredliquors.com/shop/product/field-of-dreams-small-batch-bourbon-whiskey/670fdbe1d76d41428066111b',
    scraper: 'bigred',
  },
  {
    name: 'Players Series - Big Red',
    url: 'https://bigredliquors.com/shop/product/field-of-dreams-player-series-bourbon/647eb382b132754f051df543',
    scraper: 'bigred',
  },
  // {
  //   name: 'Small Batch - Total Wine',
  //   url: 'https://www.totalwine.com/spirits/bourbon/small-batch-bourbon/field-of-dreams-small-batch-bourbon/p/2126259003?s=2701',
  //   scraper: 'totalwine',
  // },
  // {
  //   name: 'Player Series - Total Wine',
  //   url: 'https://www.totalwine.com/spirits/bourbon/field-of-dreams-bourbon/p/2126227189??s=2701',
  //   scraper: 'totalwine',
  // },
  {
    name: 'Small Batch - Liquor Barn',
    url: 'https://liquorbarn.com/shop/product/field-of-dreams-small-batch-bourbon-whiskey/670fdbe1d76d41428066111b?option-id=602f2007e833f3a6add8071579bdd6d87ab8ff12a845d79b37bc11642a79c7aa',
    scraper: 'liquorbarn',
  },
  // {
  //   name: 'Player Series - Liquor Barn',
  //   url: 'https://liquorbarn.com/shop/product/field-of-dreams-players-series-bourbon/647eb382b132754f051df543?option-id=d255bff62fdcee13f5a7eeb0686f5ee56e2f6ff6503f89a71fdf46b203a2aee8',
  //   scraper: 'liquorbarn',
  // },
]

export type Site = (typeof sites)[number]
