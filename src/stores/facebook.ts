import { defineStore } from 'pinia'

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
  store: string
  address: string
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
  }),
  actions: {
    /**
     * Constructs the Facebook Ad Set payload by merging the provided config with the default.
     *
     * @param record - The audience record containing at least the store name and address.
     * @param config - An optional configuration for the record.
     * @returns The complete payload to be submitted to Facebook.
     */
    constructAudiencePayload(
      record: AudienceRecord,
      config?: FacebookConfig,
    ): FacebookAdSetPayload {
      // Merge provided config with default, handling nested objects as needed.
      const finalConfig: FacebookConfig = {
        ...this.defaultConfig,
        ...(config || {}),
        promoted_object: {
          ...this.defaultConfig.promoted_object,
          ...(config?.promoted_object || {}),
        },
      }
      return {
        name: `${record.store} Audience`,
        optimization_goal: finalConfig.optimization_goal,
        billing_event: finalConfig.billing_event,
        bid_amount: finalConfig.bid_amount,
        daily_budget: finalConfig.daily_budget,
        campaign_id: finalConfig.campaign_id,
        targeting: {
          geo_locations: {
            custom_locations: [
              {
                address_string: record.address,
                radius: finalConfig.radius,
                distance_unit: finalConfig.distance_unit,
              },
            ],
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
      // Update the push status for this record.
      this.pushStatus[index] = {
        loading: true,
        error: null,
        response: null,
      }

      const payload = this.constructAudiencePayload(record, config)

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
  },
})
