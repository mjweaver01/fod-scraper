import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useScrapeStore = defineStore('scrape', {
  state: () => {
    return {
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

      const results = await fetch('/.netlify/functions/scrape', {
        method: 'POST',
        body: JSON.stringify({ password: this.auth.password }),
      }).then((res) => res.json())

      if (results.code === 200) {
        this.results = results.data
      } else {
        this.error = results.message
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useScrapeStore, import.meta.hot))
}
