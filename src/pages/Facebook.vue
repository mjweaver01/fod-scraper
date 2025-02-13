<template>
  <div class="facebook-page">
    <h1>Push Facebook Audiences</h1>

    <!-- Common configuration -->
    <div class="common-config">
      <h2>Common Ad Set Configuration</h2>
      <div class="form-group">
        <div>
          <label>
            Optimization Goal:
            <input type="text" v-model="common.optimization_goal" :disabled="pushingAll" />
          </label>
        </div>
        <div>
          <label>
            Billing Event:
            <input type="text" v-model="common.billing_event" :disabled="pushingAll" />
          </label>
        </div>
        <div>
          <label>
            Bid Amount:
            <input type="number" v-model.number="common.bid_amount" :disabled="pushingAll" />
          </label>
        </div>
        <div>
          <label>
            Daily Budget:
            <input type="number" v-model.number="common.daily_budget" :disabled="pushingAll" />
          </label>
        </div>
        <div>
          <label>
            Campaign ID:
            <input type="text" v-model="common.campaign_id" :disabled="pushingAll" />
          </label>
        </div>
        <div>
          <label>
            Promoted Page ID:
            <input type="text" v-model="common.promoted_object.page_id" :disabled="pushingAll" />
          </label>
        </div>
        <div>
          <label>
            Status:
            <input type="text" v-model="common.status" :disabled="pushingAll" />
          </label>
        </div>
        <div>
          <label>
            Radius:
            <input type="number" v-model.number="common.radius" :disabled="pushingAll" />
          </label>
        </div>
        <div>
          <label>
            Distance Unit:
            <select v-model="common.distance_unit" :disabled="pushingAll">
              <option value="mile">Mile</option>
              <option value="kilometer">Kilometer</option>
            </select>
          </label>
        </div>
      </div>
    </div>

    <!-- Scraped records and push buttons -->
    <div class="records">
      <h2>Scraped Records</h2>
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
            Address:
            <strong>{{ record.address }}</strong>
          </p>
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

export default {
  name: 'Facebook',
  data() {
    return {
      common: {
        optimization_goal: 'REACH',
        billing_event: 'IMPRESSIONS',
        bid_amount: 200,
        daily_budget: 500,
        campaign_id: '',
        status: 'PAUSED',
        promoted_object: {
          page_id: '',
        },
        radius: 5,
        distance_unit: 'mile',
      },
      pushStatus: {},
      pushingAll: false,
      scrapeStore: null,
    }
  },
  computed: {
    scrapedRecords() {
      return this.scrapeStore.allResults.filter(
        (record) => record.address && record.address.trim() !== '',
      )
    },
  },
  created() {
    this.scrapeStore = useScrapeStore()
  },
  methods: {
    async pushAudience(index, record) {
      this.pushStatus[index] = {
        loading: true,
        error: null,
        response: null,
      }

      const payload = {
        name: record.store + ' Audience',
        optimization_goal: this.common.optimization_goal,
        billing_event: this.common.billing_event,
        bid_amount: this.common.bid_amount,
        daily_budget: this.common.daily_budget,
        campaign_id: this.common.campaign_id,
        targeting: {
          geo_locations: {
            custom_locations: [
              {
                address_string: record.address,
                radius: this.common.radius,
                distance_unit: this.common.distance_unit,
              },
            ],
          },
        },
        status: this.common.status,
        promoted_object: {
          page_id: this.common.promoted_object.page_id,
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

.common-config,
.records {
  margin-bottom: 2rem;
}

.common-config label,
.record label {
  display: block;
  margin-bottom: 0.5rem;
}

.common-config input,
.common-config select {
  margin-left: 0.5rem;
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
