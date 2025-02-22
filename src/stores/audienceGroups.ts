import { defineStore } from 'pinia'
import { useFacebookStore } from './facebook'
import { useImportedDataStore } from './importedData'

interface LocationGroup {
  name: string
  state: string
  locations: Array<{
    address: string
    zipCode: string
    quantity: number
    stock_status: string
  }>
  campaignId: string
  status: 'ACTIVE' | 'INACTIVE'
}

export const useAudienceGroupsStore = defineStore('audienceGroups', {
  state: () => ({
    creatingGroups: false,
    pushingGroups: false,
    groups: [] as LocationGroup[],
  }),

  getters: {
    facebook: () => useFacebookStore(),
    importedData: () => useImportedDataStore(),
    records: () => useImportedDataStore().importedResults,
  },

  actions: {
    // Extract state from address string
    getStateFromAddress(address: string): string {
      // Matches state abbreviation pattern: ", XX " or ", XX," or ", XX"
      const stateMatch = address.match(/,\s*([A-Z]{2})(?:\s|,|$)/)
      return stateMatch ? stateMatch[1] : 'Unknown'
    },

    async createGroups() {
      this.creatingGroups = true
      this.groups = []

      // First group by stock status
      const stockGroups = this.records.reduce((acc, record) => {
        const key = record.in_stock ? 'in_stock' : 'out_stock'
        if (!acc[key]) acc[key] = []
        acc[key].push(record)
        return acc
      }, {})

      // Create all groups first
      const unsortedGroups = []

      // For each stock status, group by state
      for (const [stockStatus, stockRecords] of Object.entries(stockGroups)) {
        // Group records by state
        const stateGroups = stockRecords.reduce((acc, record) => {
          const state = this.getStateFromAddress(record.address)
          if (!acc[state]) {
            acc[state] = []
          }
          acc[state].push(record)
          return acc
        }, {})

        // Create location groups for each state
        for (const [state, stateRecords] of Object.entries(stateGroups)) {
          const group = {
            name: `${state} ${stockStatus === 'in_stock' ? 'In Stock' : 'Out of Stock'}`,
            state,
            locations: stateRecords,
            campaignId: '', // Will be set later
            status: stockStatus === 'in_stock' ? 'ACTIVE' : 'INACTIVE',
          }

          // Find matching campaign for this state and status
          const campaign = this.facebook.campaigns.find((c) => {
            const campaignName = c.name.toLowerCase()
            return (
              // Match state in campaign name
              campaignName.includes(state.toLowerCase()) &&
              // Match status (in stock/out of stock)
              campaignName.includes(stockStatus === 'in_stock' ? 'in' : 'out')
            )
          })

          // Fallback campaign matching just by state
          const stateCampaign = !campaign
            ? this.facebook.campaigns.find((c) =>
                c.name.toLowerCase().includes(state.toLowerCase()),
              )
            : null

          // Set campaign ID with fallbacks
          group.campaignId =
            campaign?.id || stateCampaign?.id || this.facebook.campaigns[0]?.id || ''

          unsortedGroups.push(group)
        }
      }

      // Sort groups by status (ACTIVE first) and then by state
      this.groups = unsortedGroups.sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'ACTIVE' ? -1 : 1
        }
        return a.state.localeCompare(b.state)
      })

      this.creatingGroups = false
    },

    async clearGroups() {
      this.groups = []
    },

    async pushGroupsToFacebook() {
      this.pushingGroups = true

      for (const group of this.groups) {
        // Create merged audience configuration
        const config = {
          ...this.facebook.defaultConfig,
          campaign_id: group.campaignId,
          status: group.status,
          custom_audiences: group.locations.map((location) => ({
            address: location.address,
            zip_code: location.zipCode,
            quantity: location.quantity,
            stock_status: location.stock_status,
          })),
        }

        // Push group as a single audience with multiple addresses
        await this.facebook.pushAudience(
          group.state,
          {
            name: `${group.state} - ${group.status} - ${group.locations.length} Locations`,
            custom_audiences: config.custom_audiences,
          },
          config,
        )
      }

      this.pushingGroups = false
    },
  },
})
