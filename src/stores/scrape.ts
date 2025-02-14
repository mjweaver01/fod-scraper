import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { sites, type Site } from '../../server/scrape/sites'

export const useScrapeStore = defineStore('scrape', {
  state: () => {
    return {
      status: 'idle',
      activeTab: 0,
      results: localStorage.getItem('scrapeResults')
        ? JSON.parse(localStorage.getItem('scrapeResults') || '[]')
        : [],
      sites,
    }
  },
  getters: {
    auth() {
      return useAuthStore()
    },
    sites() {
      return sites
    },
    // @ts-ignore
    activeSite() {
      // @ts-ignore
      return this.results[this.activeTab]
    },
    // @ts-ignore
    activeSiteData() {
      // @ts-ignore
      return this.activeSite?.data || []
    },
    allResults() {
      return this.results.flatMap((result: any) => {
        if (!result?.data) return []
        return result.data.map((record: any) => ({
          ...record,
          name: result.name,
          url: result.url,
          time: result.time,
        }))
      })
    },
  },
  actions: {
    async scrapeSites() {
      this.results = []
      localStorage.removeItem('scrapeResults')
      this.status = 'scraping'

      const scrapePromises = this.sites.map((page: Site) => this.scrapeSite(page))
      const results = await Promise.all(scrapePromises)
      this.results = results
      localStorage.setItem('scrapeResults', JSON.stringify(this.results))
      this.status = 'idle'
    },

    async scrapeSite(page: Site) {
      try {
        const results = await fetch('/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: this.auth.password, page }),
        }).then((res) => res.json())

        return results
      } catch {
        this.status = 'error'
      }
    },

    async saveToDB() {
      this.status = 'saving'

      const results = await fetch('/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: this.auth.password }),
      }).then((res) => res.json())

      if (results.code === 200) {
        this.status = 'saved to db'
      } else {
        this.status = 'error'
      }
    },

    computeStockStatus(status: string | boolean) {
      if (typeof status === 'string' && status?.includes('Only')) {
        return 'warning'
      } else if (status === 'In Stock' || status === true) {
        return 'good'
      } else if (status === 'Out of Stock' || status === false) {
        return 'bad'
      }

      return ''
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useScrapeStore, import.meta.hot))
}
