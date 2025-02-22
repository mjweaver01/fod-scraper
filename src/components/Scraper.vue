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
      <div class="search-filter" v-if="scrape.activeSiteData.length > 0">
        <div class="search">
          <input type="search" placeholder="Search stores..." v-model="searchTerm" />
        </div>

        <div class="controls">
          <div class="sort-dropdown">
            <label for="sortDropdown">Sort by Stock Status</label>
            <div class="select">
              <select id="sortDropdown" v-model="selectedSort">
                <option value="none">None</option>
                <option value="inFirst">In Stock First</option>
                <option value="outFirst">Out of Stock First</option>
              </select>
            </div>
          </div>
          <div class="filter-dropdown">
            <label for="stockFilterDropdown">Filter by Stock</label>
            <div class="select">
              <select id="stockFilterDropdown" v-model="selectedStockFilter">
                <option value="all">All</option>
                <option value="in">In Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </div>
          <div class="sort-dropdown" v-if="scrape.activeSiteData[0]?.quantity">
            <label for="quantitySortDropdown">Sort by Quantity</label>
            <div class="select">
              <select id="quantitySortDropdown" v-model="selectedQuantitySort">
                <option value="none">None</option>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
          <div v-if="hasActiveFilters">
            <button @click="resetFilters">Reset</button>
          </div>
        </div>
      </div>

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
          <tr v-for="(item, i) in displayRecords" :key="i">
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
  data() {
    return {
      searchTerm: '',
      selectedSort: 'none',
      selectedStockFilter: 'all',
      selectedQuantitySort: 'none',
    }
  },
  computed: {
    scrape() {
      return useScrapeStore()
    },
    scraping() {
      return this.scrape.status === 'scraping'
    },
    hasActiveFilters() {
      return (
        this.selectedStockFilter !== 'all' ||
        this.searchTerm !== '' ||
        this.selectedSort !== 'none' ||
        this.selectedQuantitySort !== 'none'
      )
    },
    filteredRecords() {
      if (!this.scrape.activeSiteData) return []

      let records = this.scrape.activeSiteData

      if (this.searchTerm.trim()) {
        const search = this.searchTerm.trim().toLowerCase()
        records = records.filter((record) => {
          return (
            this.fuzzyMatch(search, record.store) ||
            this.fuzzyMatch(search, record.address) ||
            this.fuzzyMatch(search, record.stock_status)
          )
        })
      }

      return records
    },
    displayRecords() {
      let records = this.filteredRecords

      if (this.selectedStockFilter === 'in') {
        records = records.filter((record) => record.stock_status === 'In Stock')
      } else if (this.selectedStockFilter === 'out') {
        records = records.filter((record) => record.stock_status !== 'In Stock')
      }

      if (this.selectedSort === 'inFirst') {
        records = records.slice().sort((a, b) => {
          if (a.stock_status === b.stock_status) return 0
          return a.stock_status === 'In Stock' ? -1 : 1
        })
      } else if (this.selectedSort === 'outFirst') {
        records = records.slice().sort((a, b) => {
          if (a.stock_status === b.stock_status) return 0
          return a.stock_status === 'In Stock' ? 1 : -1
        })
      }

      if (this.selectedQuantitySort === 'asc') {
        records = records.slice().sort((a, b) => a.quantity - b.quantity)
      } else if (this.selectedQuantitySort === 'desc') {
        records = records.slice().sort((a, b) => b.quantity - a.quantity)
      }

      return records
    },
  },
  methods: {
    fuzzyMatch(query, text) {
      if (!text) return false
      text = text.toString().toLowerCase()
      let queryIndex = 0
      for (let i = 0; i < text.length && queryIndex < query.length; i++) {
        if (text[i] === query[queryIndex]) {
          queryIndex++
        }
      }
      return queryIndex === query.length
    },
    resetFilters() {
      this.searchTerm = ''
      this.selectedSort = 'none'
      this.selectedStockFilter = 'all'
      this.selectedQuantitySort = 'none'
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

.search-filter {
  display: flex;
  flex-flow: column;
  gap: 1em;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1rem;

  .sort-dropdown,
  .filter-dropdown {
    display: flex;
    flex-flow: column;
  }

  @media (min-width: 768px) {
    flex-flow: row;
  }
}

.search {
  margin-bottom: 1rem;
  width: 100%;

  input {
    width: 100%;
  }
}

.controls {
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  width: 100%;

  > div {
    flex-grow: 1;
  }

  label {
    white-space: nowrap;
  }
}
</style>
