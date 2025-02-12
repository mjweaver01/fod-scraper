import { acceptHMRUpdate, defineStore } from 'pinia'

export const useScrapeStore = defineStore('scrape', {
  state: () => {
    return {
      results: [],
    }
  },
  actions: {
    async scrapeSites() {
      const results = await fetch('/.netlify/functions/scrape', {
        method: 'POST',
        body: JSON.stringify({ password: this.password }),
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
