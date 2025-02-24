import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { ref } from 'vue'

/**
 * Interface representing the configuration options for Facebook Ad Sets.
 */
export interface FacebookConfig {
  optimization_goal: string
  billing_event: string
  bid_amount: number
  daily_budget: number
  campaign_id: string
  status: string
  promoted_object: {
    page_id: string
  }
  radius: number
  distance_unit: string
}

/**
 * The default configuration used if no record-specific values are provided.
 */
export const defaultFacebookConfig: FacebookConfig = {
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
}

/**
 * Interface representing the payload expected by Facebook's API.
 */
export interface FacebookAdSetPayload {
  name: string
  optimization_goal: string
  billing_event: string
  bid_amount: number
  daily_budget: number
  campaign_id: string
  targeting: {
    geo_locations: {
      custom_locations: Array<{
        address_string: string
        radius: number
        distance_unit: string
      }>
    }
  }
  status: string
  promoted_object: {
    page_id: string
  }
}

/**
 * Interface representing the minimal record required to construct an audience.
 */
export interface AudienceRecord {
  name: string
  status: string
  locations: Array<{
    address: string
    zipCode: string
    quantity: number
    stock_status: string
  }>
  // Add any additional properties as needed.
}

/**
 * Pinia store for handling Facebook audience configuration and push logic.
 */
export const useFacebookStore = defineStore('facebook', {
  state: () => ({
    // Default configuration is stored as part of the state.
    defaultConfig: defaultFacebookConfig,
    // You can store additional, record-specific configs mapped by an identifier (e.g., index).
    recordConfigs: {} as Record<number, FacebookConfig>,
    // Stores the status for each push attempt by record index.
    pushStatus: {} as Record<number, { loading: boolean; error: string | null; response: any }>,
    // Indicates if the store is currently pushing all audiences.
    pushingAll: false,
    campaigns: ref([]),
    fetchingCampaigns: false,
    selectedCampaignId: '',
    promotedPages: ref([]),
    fetchingPromotedPages: false,
    audiences: ref([]),
    fetchingAudiences: false,
    customAudiences: ref([]),
    fetchingCustomAudiences: false,
    adSets: ref([]),
    fetchingAdSets: false,
  }),
  getters: {
    auth: () => useAuthStore(),
  },
  actions: {
    constructAdsetPayload(record: AudienceRecord, config?: FacebookConfig): FacebookAdSetPayload {
      return {
        name: record.name,
        optimization_goal: this.defaultConfig.optimization_goal,
        campaign_id: this.selectedCampaignId,
        billing_event: this.defaultConfig.billing_event,
        bid_amount: this.defaultConfig.bid_amount,
        daily_budget: this.defaultConfig.daily_budget,
        targeting: {
          geo_locations: {
            custom_locations: record.locations.map((location) => ({
              address_string: location.address,
              radius: 5,
              distance_unit: 'mile',
            })),
          },
        },
        status: 'PAUSED',
        // status: record.status,
        // promoted_object: {
        //   page_id: this.defaultConfig.promoted_object.page_id,
        // },
      }
    },
    /**
     * Pushes a single audience record to Facebook.
     *
     * @param index - The index of the record (used to handle record-specific config and status).
     * @param record - The audience record.
     */
    async pushAdset(index: number, record: AudienceRecord) {
      if (this.adSets.find((adset) => adset.name === record.name)) {
        return 'Adset already exists'
      }

      const config = this.recordConfigs[index] || this.defaultConfig
      this.pushStatus[index] = {
        loading: true,
        error: null,
        response: null,
      }

      const payload = this.constructAdsetPayload(record, config)
      console.log('payload', payload)

      try {
        const res = await fetch('/facebook/push-adset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: this.auth.password,
            payload,
          }),
        })
        const data = await res.json()
        await this.fetchAdSets()
        this.pushStatus[index] = {
          loading: false,
          error: null,
          response: data,
        }
      } catch (err: any) {
        this.pushStatus[index] = {
          loading: false,
          error: err.message,
          response: null,
        }
      }
    },

    /**
     * Pushes all audience records concurrently.
     *
     * @param records - An array of audience records to be pushed.
     */
    async pushAllAdsets(records: AudienceRecord[]) {
      this.pushingAll = true
      const promises = records.map((record, index) => this.pushAdset(index, record))
      await Promise.all(promises)
      this.pushingAll = false
    },

    /**x
     * Fetches all campaigns from Facebook.
     */
    async fetchCampaigns() {
      if (this.campaigns.length) return

      this.fetchingCampaigns = true
      const res = await fetch('/facebook/campaigns')
      const data = await res.json()
      this.campaigns = data.data
      this.fetchingCampaigns = false
    },

    async fetchPromotedPages() {
      if (this.promotedPages.length) return

      this.fetchingPromotedPages = true
      try {
        const response = await fetch('/facebook/promoted-pages')
        const data = await response.json()
        if (!data.error) {
          this.promotedPages = data.data
        }
      } catch (error) {
        console.error('Error fetching promoted pages:', error)
      }
      this.fetchingPromotedPages = false
    },

    async fetchAdSets() {
      this.fetchingAdSets = true
      const res = await fetch('/facebook/adsets')
      const data = await res.json()
      this.adSets = data.data
      this.fetchingAdSets = false
    },

    async fetchAudiences() {
      this.fetchingAudiences = true
      const res = await fetch('/facebook/audiences')
      const data = await res.json()
      this.audiences = data.data
      this.fetchingAudiences = false
    },

    async fetchCustomAudiences() {
      this.fetchingCustomAudiences = true
      const res = await fetch('/facebook/custom-audiences')
      const data = await res.json()
      this.customAudiences = data.data
    },

    constructCustomAudiencePayload(record: AudienceRecord): any {
      // Construct the payload with necessary fields for a custom audience
      return {
        name: record.name,
        description: record.name + ' Audience',
        subtype: 'CUSTOM',
        customer_file_source: 'USER_PROVIDED_ONLY',
        retention_days: 30,
        targeting: {
          geo_locations: {
            custom_locations: record.locations.map((location) => ({
              address_string: location.address,
              radius: 5,
              distance_unit: 'mile',
            })),
          },
        },
        use_in_campaigns: true,
        // Add other parameters as needed
      }
    },

    async pushCustomAudience(index: number, record: AudienceRecord) {
      // Update the push status for this record.
      this.pushStatus[index] = {
        loading: true,
        error: null,
        response: null,
      }

      const payload = this.constructCustomAudiencePayload(record)
      console.log('payload', payload)

      try {
        const res = await fetch('/facebook/push-custom-audience', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: this.auth.password,
            payload,
          }),
        })
        const data = await res.json()
        this.pushStatus[index] = {
          loading: false,
          error: null,
          response: data,
        }
      } catch (err: any) {
        this.pushStatus[index] = {
          loading: false,
          error: err.message,
          response: null,
        }
      }
    },
  },
})
