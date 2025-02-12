<template>
  <div class="scraper-wrapper">
    <div class="scraper-status">{{ scrapeStatus }}</div>
    <div class="scraper-results">
      <div v-for="result in scrapeStore.results" :key="result.id">
        <h3>{{ result.name }}</h3>
        <p>{{ result.stock_status }}</p>
      </div>
    </div>
    <button @click="scrapeSites">Scrape Sites</button>
  </div>
</template>

<script>
import { useScrapeStore } from '@/stores/scrape'

export default {
  data() {
    return {
      scrapeStatus: 'idle',
    }
  },
  computed: {
    scrapeStore() {
      return useScrapeStore()
    },
  },
  methods: {
    async scrapeSites() {
      this.scrapeStatus = 'scraping'
      try {
        await this.scrapeStore.scrapeSites()
        this.scrapeStatus = 'idle'
      } catch (error) {
        this.scrapeStatus = 'error'
        console.error(error)
      }
    },
  },
}
</script>

<style scoped>
.scraper-results {
  padding: 1rem;
}
</style>
