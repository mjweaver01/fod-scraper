<template>
  <div class="scraper-wrapper">
    <div class="scraper-status" :class="computeStatus(scrape.status)">{{ scrape.status }}</div>
    <div class="scraper-controls">
      <button @click="scrape.scrapeSites()" :disabled="scraping">Scrape Sites</button>
      <button v-if="scrape.results.length > 0" :disabled="scraping" @click="scrape.saveToDB">
        Save to DB
      </button>
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

    <div class="scraper-time" v-if="scrape.activeSite?.time">
      Last Scraped: <strong>{{ new Date(scrape.activeSite.time).toLocaleString() }}</strong>
    </div>

    <div class="tab-content">
      <table class="scraper-results" v-if="scrape.activeSiteData.length > 0">
        <thead>
          <tr>
            <th class="store">Store</th>
            <th class="address" v-if="scrape.activeSiteData[0].address">Address</th>
            <th>Status</th>
            <th class="quantity" v-if="scrape.activeSiteData[0].quantity">Quantity</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in scrape.activeSiteData" :key="i">
            <td class="store">{{ item.store }}</td>
            <td class="address" v-if="item.address">
              {{ item.address }}
            </td>
            <td>
              <span class="stock-status" :class="scrape.computeStockStatus(item.stock_status)">
                {{ item.stock_status }}
              </span>
            </td>
            <td class="quantity" v-if="item.quantity">
              {{ item.quantity }}
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else>
        <p v-if="scraping">Scraping...</p>
        <p v-else>No data available for this site.</p>
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
    scraping() {
      return this.scrape.status === 'scraping'
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

.scraper-time {
  margin-bottom: 1rem;
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
  max-width: 600px;
  margin: 0 auto;

  th.store,
  td.store,
  th.address,
  td.address {
    text-align: left;
  }

  td {
    padding: 0.5rem 0;
  }
}

.stock-status,
.scraper-status {
  display: block;
}
</style>
