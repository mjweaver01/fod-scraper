<template>
  <div class="scraper-wrapper">
    <div class="scraper-header">
      <h1>Scrape ({{ scrape.sites.length }} Products/Locations)</h1>
      <div class="scraper-status" :class="computeStatus(scrape.status)">{{ scrape.status }}</div>
    </div>
    <div class="scraper-controls">
      <button @click="scrape.scrapeSites()" :disabled="scraping">Scrape All Sites</button>
      <button
        v-if="scrape.results.length > 0"
        :disabled="scraping || true"
        @click="scrape.saveToDB"
      >
        Save to DB
      </button>
    </div>

    <hr />

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

    <div class="scraper-time-container">
      <div v-if="scraping"><strong>Scraping...</strong></div>
      <div v-else-if="scrape.activeSite?.time">
        Last Scraped: <strong>{{ new Date(scrape.activeSite.time).toLocaleString() }}</strong>
      </div>
      <div v-else>No data available for this site.</div>

      <button
        v-if="scrape.sites[scrape.activeTab]?.name"
        :disabled="scraping"
        @click="scrape.scrapeActiveSite()"
      >
        Scrape {{ scrape.sites[scrape.activeTab].name }}
      </button>
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
.scraper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h1 {
    margin-bottom: 0;
  }
}

.scraper-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.scraper-time-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
}

.tabs {
  display: flex;
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
    white-space: nowrap;

    &.active {
      background: var(--black);
    }

    &:hover {
      background: var(--dark-gray);
    }
  }
}

.tab-content {
  overflow-x: auto;
}

table {
  width: 100%;
  margin: 0 auto;
  border-collapse: collapse;

  th.store,
  td.store,
  th.address,
  td.address {
    text-align: left;
  }

  th,
  td {
    padding: 0.5rem;
    border: 1px solid var(--light-gray);
  }
}

.stock-status {
  display: block;
}

.scraper-status {
  margin: 0;
}
</style>
