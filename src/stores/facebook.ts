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
  status: 'INACTIVE', // default to inactive until manually activated
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
  store: string
  address: string
  custom_locations: Array<{
    address_string: string
    radius: number
    distance_unit: string
  }>
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
      const finalConfig = {
        ...this.defaultConfig,
        ...(config || {}),
        promoted_object: {
          ...this.defaultConfig.promoted_object,
          ...(config?.promoted_object || {}),
        },
      }

      return {
        name: `${record.name} Audience`,
        optimization_goal: finalConfig.optimization_goal,
        billing_event: finalConfig.billing_event,
        bid_amount: finalConfig.bid_amount,
        daily_budget: finalConfig.daily_budget,
        targeting: {
          geo_locations: {
            custom_locations: record.custom_locations.map((location) => ({
              address_string: location.address_string,
              radius: location.radius,
              distance_unit: location.distance_unit,
            })),
          },
        },
        status: finalConfig.status,
        promoted_object: {
          page_id: finalConfig.promoted_object.page_id,
        },
      }
    },
    /**
     * Pushes a single audience record to Facebook.
     *
     * @param index - The index of the record (used to handle record-specific config and status).
     * @param record - The audience record.
     */
    async pushAudience(index: number, record: AudienceRecord) {
      const config = this.recordConfigs[index] || this.defaultConfig
      this.pushStatus[index] = {
        loading: true,
        error: null,
        response: null,
      }

      const payload = this.constructAdsetPayload(record, config)

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
    async pushAllAudiences(records: AudienceRecord[]) {
      this.pushingAll = true
      const promises = records.map((record, index) => this.pushAudience(index, record))
      await Promise.all(promises)
      this.pushingAll = false
    },

    // async pushCustomAudience(index: number, record: AudienceRecord) {
    //   const config = this.recordConfigs[index] || this.defaultConfig
    //   // Update the push status for this record.
    //   this.pushStatus[index] = {
    //     loading: true,
    //     error: null,
    //     response: null,
    //   }

    //   const payload = this.constructCustomAudiencePayload(record, config)

    //   try {
    //     const res = await fetch('/facebook/push-custom-audience', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify({
    //         password: this.auth.password,
    //         payload,
    //       }),
    //     })
    //     const data = await res.json()
    //     this.pushStatus[index] = {
    //       loading: false,
    //       error: null,
    //       response: data,
    //     }
    //   } catch (err: any) {
    //     this.pushStatus[index] = {
    //       loading: false,
    //       error: err.message,
    //       response: null,
    //     }
    //   }
    // },

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
      if (this.adSets.length) return

      this.fetchingAdSets = true
      const res = await fetch('/facebook/adsets')
      const data = await res.json()
      this.adSets = data.data
      this.fetchingAdSets = false
    },

    async fetchAudiences() {
      if (this.audiences.length) return

      this.fetchingAudiences = true
      const res = await fetch('/facebook/audiences')
      const data = await res.json()
      this.audiences = data.data
      this.fetchingAudiences = false
    },

    async fetchCustomAudiences() {
      if (this.customAudiences.length) return

      this.fetchingCustomAudiences = true
      const res = await fetch('/facebook/custom-audiences')
      const data = await res.json()
      this.customAudiences = data.data
    },

    constructCustomAudiencePayload(record: AudienceRecord, config?: FacebookConfig): any {
      // Use the provided config or default to the store's default configuration
      const finalConfig = {
        ...this.defaultConfig,
        ...(config || {}),
        promoted_object: {
          ...this.defaultConfig.promoted_object,
          ...(config?.promoted_object || {}),
        },
      }

      // Construct the payload with necessary fields for a custom audience
      return {
        name: record.name,
        description: record.name + ' Audience',
        subtype: 'CUSTOM',
        customer_file_source: 'USER_PROVIDED_ONLY',
        retention_days: 30,
        users: record.locations.map((location) => ({
          first_name: location.address.split(' ')[0], // Example: Extract first name from address
          last_name: location.address.split(' ')[1], // Example: Extract last name from address
          country: 'US', // Example: Set a default country
          zip: location.zipCode,
          city: location.address.split(',')[1]?.trim(), // Example: Extract city from address
          state: location.address.split(',')[2]?.trim(), // Example: Extract state from address
          address: location.address,
        })),
        use_in_campaigns: true,
        // Add other parameters as needed
      }
    },

    async pushCustomAudience(index: number, record: AudienceRecord) {
      const config = this.recordConfigs[index] || this.defaultConfig
      // Update the push status for this record.
      this.pushStatus[index] = {
        loading: true,
        error: null,
        response: null,
      }

      const payload = this.constructCustomAudiencePayload(record, config)
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
