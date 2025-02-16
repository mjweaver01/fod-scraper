<template>
  <div class="scraper-wrapper">
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
              <span class="pill stock-status" :class="scrape.computeStockStatus(item.stock_status)">
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
}
</script>

<style lang="scss" scoped>
.scraper-time-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
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
</style>
