<template>
  <div class="scraper-wrapper">
    <div class="scraper-status">{{ scrapeStatus }}</div>
    <table class="scraper-results">
      <thead>
        <tr>
          <th>Store</th>
          <th>Phone</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="result in scrapeStore.results" :key="result.id">
          <td>{{ result.store }}</td>
          <td>{{ result.phone }}</td>
          <td>{{ result.stock_status }}</td>
        </tr>
      </tbody>
    </table>
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
