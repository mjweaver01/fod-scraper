import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAuthStore } from './auth'
import sites from '../../server/scrape/sites'

export const useScrapeStore = defineStore('scrape', {
  state: () => {
    return {
      status: 'idle',
      activeTab: 0,
      results: [],
    }
  },
  getters: {
    auth() {
      return useAuthStore()
    },
    sites() {
      return sites
    },
    activeSiteData() {
      return this.results[this.activeTab]?.data || []
    },
    allResults() {
      return this.results.flatMap((result) => result.data)
    },
  },
  actions: {
    async scrapeSites() {
      this.results = []
      this.status = 'scraping'

      const scrapePromises = this.sites.map((page) => this.scrapeSite(page))
      const results = await Promise.all(scrapePromises)
      this.results = results
      this.status = 'idle'
    },

    async scrapeSite(page) {
      try {
        const results = await fetch('/.netlify/functions/scrape', {
          method: 'POST',
          body: JSON.stringify({ password: this.auth.password, page }),
        }).then((res) => res.json())

        return results
      } catch {
        this.status = 'error'
      }
    },

    async saveToDB() {
      this.status = 'saving'

      const results = await fetch('/.netlify/functions/save', {
        method: 'POST',
        body: JSON.stringify({ password: this.auth.password }),
      }).then((res) => res.json())

      if (results.code === 200) {
        this.status = 'saved to db'
      } else {
        this.status = 'error'
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useScrapeStore, import.meta.hot))
}
