<template>
  <div class="facebook-page">
    <h1>Push Facebook Audiences</h1>

    <div class="records">
      <button
        class="push-all"
        @click="pushAllAudiences"
        :disabled="pushingAll || scrapedRecords.length === 0"
      >
        Push All Audiences
      </button>
      <div v-if="pushingAll" class="global-loading">Pushing all audiences, please wait...</div>
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
          <!-- Show the record-specific common configuration -->
          <AdsetConfig
            :modelValue="recordConfigs[index] || defaultConfig"
            :disabled="pushingAll"
            @update:modelValue="(val) => (recordConfigs[index] = val)"
          />
          <button
            @click="pushAudience(index, record)"
            :disabled="pushingAll || (pushStatus[index] && pushStatus[index].loading)"
          >
            Push Audience
          </button>
          <div v-if="pushStatus[index] && pushStatus[index].loading">Pushing...</div>
          <div v-if="pushStatus[index] && pushStatus[index].response" class="response">
            Response:
            <pre>{{ pushStatus[index].response }}</pre>
          </div>
          <div v-if="pushStatus[index] && pushStatus[index].error" class="error">
            Error: {{ pushStatus[index].error }}
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
import AdsetConfig from '@/components/AdsetConfig.vue'

export default {
  name: 'Facebook',
  components: {
    AdsetConfig,
  },
  data() {
    return {
      // Default configuration for each record
      defaultConfig: {
        optimization_goal: 'REACH',
        billing_event: 'IMPRESSIONS',
        bid_amount: 200,
        daily_budget: 500,
        campaign_id: '',
        status: 'INACTIVE', // preselected to inactive
        promoted_object: {
          page_id: '',
        },
        radius: 5,
        distance_unit: 'mile',
      },
      recordConfigs: [],
      pushStatus: {},
      pushingAll: false,
    }
  },
  computed: {
    scrape() {
      return useScrapeStore()
    },
    scrapedRecords() {
      return (
        this.scrape?.allResults?.filter(
          (record) => record?.address && record?.address?.trim() !== '',
        ) || []
      )
    },
  },
  watch: {
    scrapedRecords: {
      handler(newRecords) {
        // Initialize a configuration for each record if not already set
        newRecords?.forEach((record, index) => {
          if (!this.recordConfigs[index]) {
            // Determine the preset status based on product availability
            const presetStatus = record.in_stock ? 'ACTIVE' : 'INACTIVE'
            this.recordConfigs[index] = {
              ...this.defaultConfig,
              status: presetStatus,
            }
          }
        })
      },
      immediate: true,
    },
  },
  methods: {
    async pushAudience(index, record) {
      // Use record-specific config (or default if missing)
      const config = this.recordConfigs[index] || this.defaultConfig
      this.pushStatus[index] = {
        loading: true,
        error: null,
        response: null,
      }

      const payload = {
        name: record.store + ' Audience',
        optimization_goal: config.optimization_goal,
        billing_event: config.billing_event,
        bid_amount: config.bid_amount,
        daily_budget: config.daily_budget,
        campaign_id: config.campaign_id,
        targeting: {
          geo_locations: {
            custom_locations: [
              {
                address_string: record.address,
                radius: config.radius,
                distance_unit: config.distance_unit,
              },
            ],
          },
        },
        status: config.status,
        promoted_object: {
          page_id: config.promoted_object.page_id,
        },
      }

      try {
        const res = await fetch('/.netlify/functions/push-to-facebook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        this.pushStatus[index] = {
          loading: false,
          error: null,
          response: data,
        }
      } catch (err) {
        this.pushStatus[index] = {
          loading: false,
          error: err.message,
          response: null,
        }
      }
    },
    async pushAllAudiences() {
      this.pushingAll = true
      const promises = this.scrapedRecords.map((record, index) => {
        return this.pushAudience(index, record)
      })
      await Promise.all(promises)
      this.pushingAll = false
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
