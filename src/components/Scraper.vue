<template>
  <div class="scraper">
    <button @click="scrapeSites">Scrape Sites</button>
    <div class="scraper-status">{{ scrapeStatus }}</div>
    <div class="scraper-results">
      <div v-for="result in scrapeStore.results" :key="result.id">
        <h3>{{ result.name }}</h3>
        <p>{{ result.stock_status }}</p>
      </div>
    </div>
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
      await this.scrapeStore.scrapeSites()
      this.scrapeStatus = 'idle'
    },
  },
}
</script>

<style scoped>
.scraper {
  padding: 1rem;
}
</style>
