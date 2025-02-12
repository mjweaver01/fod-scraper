<template>
  <div class="scraper-wrapper">
    <div class="scraper-status">{{ scrapeStatus }}</div>
    <button @click="scrapeSites">Scrape Sites</button>
    <table class="scraper-results" v-if="scrapeStore.results.length > 0">
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
          <td>
            <span class="stock-status" :class="computeStockStatus(result.stock_status)">
              {{ result.stock_status }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
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
    computeStockStatus(status) {
      if (status === 'In Stock') {
        return 'in-stock'
      } else if (status === 'Out of Stock') {
        return 'out-of-stock'
      } else if (status.includes('Only')) {
        return 'limited-stock'
      }
    },
  },
}
</script>

<style lang="scss" scoped>
button {
  margin: 1rem 0;
}

table {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;

  th:first-of-type,
  td:first-of-type,
  th:nth-of-type(2),
  td:nth-of-type(2) {
    text-align: left;
  }

  td {
    padding: 0.5rem 0;
  }
}

.stock-status {
  display: block;
  font-weight: 400;
  border-radius: 5px;
  background: var(--gray);
  color: var(--white);
  padding: 0.25rem 0.5rem;

  &.in-stock {
    background: var(--green);
  }

  &.out-of-stock {
    background: var(--red);
  }

  &.limited-stock {
    background: var(--yellow);
    color: var(--red);
  }
}
</style>
