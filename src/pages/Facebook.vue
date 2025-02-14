<template>
  <div class="page facebook-page">
    <h1>Push Facebook Audiences</h1>

    <div class="records">
      <button
        class="push-all"
        @click="facebook.pushAllAudiences(displayRecords)"
        :disabled="facebook.pushingAll || displayRecords.length === 0"
      >
        Push All Audiences
      </button>
      <div v-if="facebook.pushingAll" class="global-loading">
        Pushing all audiences, please wait...
      </div>

      <hr />

      <div class="search-filter">
        <div class="search">
          <input type="search" placeholder="Search audiences..." v-model="searchTerm" />
        </div>

        <div class="controls">
          <div class="sort-dropdown">
            <label for="sortDropdown">Sort by Stock Status:</label>
            <select id="sortDropdown" v-model="selectedSort">
              <option value="none">None</option>
              <option value="inFirst">In Stock First</option>
              <option value="outFirst">Out of Stock First</option>
            </select>
          </div>
          <div class="filter-dropdown">
            <label for="stockFilterDropdown">Filter by Stock:</label>
            <select id="stockFilterDropdown" v-model="selectedStockFilter">
              <option value="all">All</option>
              <option value="in">In Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      <table v-if="displayRecords.length" class="records-table">
        <thead>
          <tr>
            <th>Store</th>
            <th>Product</th>
            <th>Address</th>
            <th>Stock Status</th>
            <th>Actions</th>
            <th>Response</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(record, index) in displayRecords" :key="index">
            <tr>
              <td>{{ record.store }}</td>
              <td>{{ record.name }}</td>
              <td>{{ record.address || 'No address provided' }}</td>
              <td>
                <span class="stock-status" :class="scrape.computeStockStatus(record.stock_status)">
                  {{ record.stock_status }}
                </span>
              </td>
              <td>
                <button
                  @click="facebook.pushAudience(index, record)"
                  :disabled="
                    facebook.pushingAll ||
                    (facebook.pushStatus[index] && facebook.pushStatus[index].loading)
                  "
                >
                  Push Audience
                </button>
                <div v-if="facebook.pushStatus[index] && facebook.pushStatus[index].loading">
                  Pushing...
                </div>
                <button @click="toggleAccordion(index)" :disabled="facebook.pushingAll">
                  {{ isAccordionOpen(index) ? 'Hide' : 'Show' }} Config
                </button>
              </td>
              <td class="response-container">
                <div
                  v-if="facebook.pushStatus[index] && facebook.pushStatus[index].response"
                  class="response"
                >
                  <pre>{{ facebook.pushStatus[index].response }}</pre>
                </div>
                <div
                  v-if="facebook.pushStatus[index] && facebook.pushStatus[index].error"
                  class="error"
                >
                  {{ facebook.pushStatus[index].error }}
                </div>
              </td>
            </tr>
            <tr v-if="isAccordionOpen(index)" class="accordion-content">
              <td colspan="6">
                <AdsetConfig
                  :record="record"
                  :modelValue="facebook.recordConfigs[index] || facebook.defaultConfig"
                  :disabled="facebook.pushingAll"
                  @update:modelValue="(val) => (facebook.recordConfigs[index] = val)"
                />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <div v-else>
        <p>No scraped records available.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useScrapeStore } from '@/stores/scrape'
import { useFacebookStore } from '@/stores/facebook'
import AdsetConfig from '@/components/AdsetConfig.vue'

export default {
  name: 'Facebook',
  components: {
    AdsetConfig,
  },
  data() {
    return {
      searchTerm: '',
      selectedSort: 'none',
      selectedStockFilter: 'all',
      accordionState: {},
    }
  },
  computed: {
    scrape() {
      return useScrapeStore()
    },
    facebook() {
      return useFacebookStore()
    },
    scrapedRecords() {
      // Filter records that have a valid address.
      return (
        this.scrape?.allResults?.filter(
          (record) => record?.address && record?.address.trim() !== '',
        ) || []
      )
    },
    filteredRecords() {
      // Attach the original index to each record so we can reference it later.
      const recordsWithIndex = this.scrapedRecords.map((record, index) => ({
        ...record,
        __index: index,
      }))

      // If there's no search term, return all records.
      if (!this.searchTerm.trim()) {
        return recordsWithIndex
      }

      const search = this.searchTerm.trim().toLowerCase()
      return recordsWithIndex.filter((record) => {
        // Check if the search term fuzzily matches any of the target fields.
        return (
          this.fuzzyMatch(search, record.store) ||
          this.fuzzyMatch(search, record.name) ||
          this.fuzzyMatch(search, record.address) ||
          this.fuzzyMatch(search, record.stock_status)
        )
      })
    },
    // New computed property combining search filter, stock filter, and sorting.
    displayRecords() {
      let records = this.filteredRecords

      // Apply filter dropdown for In Stock / Out of Stock.
      if (this.selectedStockFilter === 'in') {
        records = records.filter((record) => record.in_stock)
      } else if (this.selectedStockFilter === 'out') {
        records = records.filter((record) => !record.in_stock)
      }

      // Apply sorting dropdown for stock status.
      // "In Stock First" will put records where record.in_stock is truthy at the top.
      // "Out of Stock First" will do the opposite.
      if (this.selectedSort === 'inFirst') {
        records = records.slice().sort((a, b) => {
          if (a.in_stock === b.in_stock) return 0
          return a.in_stock ? -1 : 1
        })
      } else if (this.selectedSort === 'outFirst') {
        records = records.slice().sort((a, b) => {
          if (a.in_stock === b.in_stock) return 0
          return a.in_stock ? 1 : -1
        })
      }
      return records
    },
  },
  methods: {
    /**
     * A simple fuzzy matching algorithm.
     * Returns true if all characters in the query appear in order within the text.
     */
    fuzzyMatch(query, text) {
      if (!text) return false
      text = text.toLowerCase()
      let queryIndex = 0
      for (let i = 0; i < text.length && queryIndex < query.length; i++) {
        if (text[i] === query[queryIndex]) {
          queryIndex++
        }
      }
      return queryIndex === query.length
    },
    toggleAccordion(index) {
      this.accordionState[index] = !this.accordionState[index]
    },
    isAccordionOpen(index) {
      return this.accordionState[index] || false
    },
  },
  watch: {
    scrapedRecords: {
      handler(newRecords) {
        // Initialize record-specific configuration in the Facebook store if not already set.
        newRecords.forEach((record, index) => {
          if (!this.facebook.recordConfigs[index]) {
            const presetStatus = record.in_stock ? 'ACTIVE' : 'INACTIVE'
            this.facebook.recordConfigs[index] = {
              ...this.facebook.defaultConfig,
              status: presetStatus,
            }
          }
        })
      },
      immediate: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.search-filter {
  display: flex;
  gap: 1em;
  justify-content: space-between;
  align-items: flex-end;

  .sort-dropdown,
  .filter-dropdown {
    display: flex;
    flex-flow: column;

    label {
      font-size: 0.8rem;
    }
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
  align-items: center;
}

.records {
  margin-bottom: 2rem;
}

.records-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
}

.records-table th,
.records-table td {
  border: 1px solid var(--light-gray);
  padding: 0.5rem;
  text-align: left;
}

.stock-status {
  display: block;
}

.response-container pre {
  overflow: auto;
  width: 100%;
}

.accordion-content {
  background-color: var(--light-gray);
}

.response,
.error {
  margin-top: 0.5rem;
}

.error {
  color: var(--red);
}

.global-loading {
  margin: 1rem 0;
  font-weight: bold;
}
</style>
