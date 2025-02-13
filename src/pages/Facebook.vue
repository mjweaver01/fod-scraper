<template>
  <div class="facebook-page">
    <h1>Push Facebook Audiences</h1>

    <div class="records">
      <button
        class="push-all"
        @click="facebook.pushAllAudiences(scrapedRecords)"
        :disabled="facebook.pushingAll || scrapedRecords.length === 0"
      >
        Push All Audiences
      </button>
      <div v-if="facebook.pushingAll" class="global-loading">
        Pushing all audiences, please wait...
      </div>
      <div v-if="scrapedRecords.length">
        <div class="record" v-for="(record, index) in scrapedRecords" :key="index">
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
            :modelValue="facebook.recordConfigs[index] || facebook.defaultConfig"
            :disabled="facebook.pushingAll"
            @update:modelValue="(val) => (facebook.recordConfigs[index] = val)"
          />
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
          <div
            v-if="facebook.pushStatus[index] && facebook.pushStatus[index].response"
            class="response"
          >
            Response:
            <pre>{{ facebook.pushStatus[index].response }}</pre>
          </div>
          <div v-if="facebook.pushStatus[index] && facebook.pushStatus[index].error" class="error">
            Error: {{ facebook.pushStatus[index].error }}
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
