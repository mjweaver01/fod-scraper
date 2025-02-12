<template>
  <div class="scraper-wrapper">
    <div class="scraper-status" :class="computeStatus(scrape.status)">{{ scrape.status }}</div>
    <div class="scraper-controls">
      <button @click="scrape.scrapeSites()">Scrape Sites</button>
      <button v-if="scrape.results.length > 0" @click="scrape.saveToDB">Save to DB</button>
    </div>
    <table class="scraper-results" v-if="scrape.results.length > 0">
      <thead>
        <tr>
          <th>Store</th>
          <th>Phone</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="result in scrape.results" :key="result.id">
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
  computed: {
    scrape() {
      return useScrapeStore()
    },
  },
  methods: {
    computeStatus(status) {
      if (status === 'scraping') {
        return ''
      } else if (status === 'saved') {
        return 'good'
      }
    },
    computeStockStatus(status) {
      if (status === 'In Stock') {
        return 'good'
      } else if (status === 'Out of Stock') {
        return 'bad'
      } else if (status.includes('Only')) {
        return 'warning'
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.scraper-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  button {
    margin: 1rem 0;
  }
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

.stock-status,
.scraper-status {
  display: block;
  font-weight: 400;
  border-radius: 5px;
  background: var(--gray);
  color: var(--white);
  padding: 0.25rem 0.5rem;
  max-width: 125px;
  margin: 0 auto;

  &.good {
    background: var(--green);
  }

  &.bad {
    background: var(--red);
  }

  &.warning {
    background: var(--yellow);
    color: var(--red);
  }
}
</style>
