<template>
  <div class="scraper-wrapper">
    <div class="scraper-status" :class="computeStatus(scrape.status)">{{ scrape.status }}</div>
    <div class="scraper-controls">
      <button @click="scrape.scrapeSites()">Scrape Sites</button>
      <button v-if="scrape.results.length > 0" @click="scrape.saveToDB">Save to DB</button>
    </div>

    <div class="tabs">
      <button
        v-for="(result, index) in scrape.sites"
        :key="index"
        :class="{ active: scrape.activeTab === index }"
        @click="scrape.activeTab = index"
      >
        {{ result.name }}
      </button>
    </div>

    <div class="tab-content">
      <table class="scraper-results" v-if="scrape.activeSiteData.length > 0">
        <thead>
          <tr>
            <th>Store</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in scrape.activeSiteData" :key="i">
            <td>{{ item.store }}</td>
            <td>
              <span class="stock-status" :class="computeStockStatus(item.stock_status)">
                {{ item.stock_status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else>
        <p>No data available for this site.</p>
      </div>
    </div>
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
      if (!status) return ''

      if (status === 'scraping') {
        return 'warning'
      } else if (status === 'saved') {
        return 'good'
      }
    },
    computeStockStatus(status) {
      if (!status) return ''

      if (status === 'In Stock') {
        return 'good'
      } else if (status === 'Out of Stock') {
        return 'bad'
      } else if (status.includes('Only')) {
        return 'warning'
      }
    },
  },
  watch: {
    // Whenever new scrape results are loaded, reset the active tab.
    'scrape.results'(newResults) {
      if (newResults.length > 0) {
        this.scrape.activeTab = 0
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

/* Styles for the Tab Navigation */
.tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  width: 100%;
  overflow-x: auto;

  button {
    padding: 0.5rem 1rem;
    border: none;
    background: var(--gray);
    color: var(--white);
    border-radius: 5px;
    cursor: pointer;

    &.active {
      background: var(--black);
    }
  }
}

table {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;

  th:first-of-type,
  td:first-of-type {
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
