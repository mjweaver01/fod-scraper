<template>
  <div class="facebook-page">
    <h1>Push Facebook Audiences</h1>

    <div class="records">
      <button
        class="push-all"
        @click="facebook.pushAllAudiences(filteredRecords)"
        :disabled="facebook.pushingAll || filteredRecords.length === 0"
      >
        Push All Audiences
      </button>
      <div v-if="facebook.pushingAll" class="global-loading">
        Pushing all audiences, please wait...
      </div>

      <hr />

      <div class="search">
        <input type="text" placeholder="Search audiences..." v-model="searchTerm" />
      </div>

      <div v-if="filteredRecords.length">
        <div class="record" v-for="record in filteredRecords" :key="record.__index">
          <h3>{{ record.store }}</h3>
          <p>
            Product: <strong>{{ record.name }}</strong>
          </p>
          <p>
            Address:
            <strong>{{ record.address || 'No address provided' }}</strong>
          </p>
          <p>
            Stock Status:
            <span class="stock-status" :class="scrape.computeStockStatus(record.stock_status)">
              {{ record.stock_status }}
            </span>
          </p>
          <!-- Use record-specific config from the Facebook store -->
          <AdsetConfig
            :modelValue="facebook.recordConfigs[record.__index] || facebook.defaultConfig"
            :disabled="facebook.pushingAll"
            @update:modelValue="(val) => (facebook.recordConfigs[record.__index] = val)"
          />
          <button
            @click="facebook.pushAudience(record.__index, record)"
            :disabled="
              facebook.pushingAll ||
              (facebook.pushStatus[record.__index] && facebook.pushStatus[record.__index].loading)
            "
          >
            Push Audience
          </button>
          <div
            v-if="
              facebook.pushStatus[record.__index] && facebook.pushStatus[record.__index].loading
            "
          >
            Pushing...
          </div>
          <div
            v-if="
              facebook.pushStatus[record.__index] && facebook.pushStatus[record.__index].response
            "
            class="response"
          >
            Response:
            <pre>{{ facebook.pushStatus[record.__index].response }}</pre>
          </div>
          <div
            v-if="facebook.pushStatus[record.__index] && facebook.pushStatus[record.__index].error"
            class="error"
          >
            Error: {{ facebook.pushStatus[record.__index].error }}
          </div>
        </div>
      </div>
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
      searchTerm: '', // Holds user input for fuzzy search
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

<style scoped>
.facebook-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

hr {
  margin: 1rem 0 2rem;
  border: 0;
  border-top: 1px solid var(--light-gray);
}

.search {
  margin-bottom: 1rem;
}

.records {
  margin-bottom: 2rem;
}

.record {
  border: 1px solid var(--light-gray);
  padding: 1rem;
  margin-bottom: 1rem;
}

button {
  margin-top: 0.5rem;
}

.push-all {
  margin-bottom: 1rem;
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
