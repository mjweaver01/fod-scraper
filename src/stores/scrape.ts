import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useScrapeStore = defineStore('scrape', {
  state: () => {
    return {
      status: 'idle',
      results: [],
    }
  },
  getters: {
    auth() {
      return useAuthStore()
    },
  },
  actions: {
    async scrapeSites() {
      this.results = []
      this.status = 'scraping'

      const results = await fetch('/.netlify/functions/scrape', {
        method: 'POST',
        body: JSON.stringify({ password: this.auth.password }),
      }).then((res) => res.json())

      if (results.code === 200) {
        this.results = results.data
        this.status = 'idle'
      } else {
        this.results = []
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
