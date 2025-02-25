import { defineStore } from 'pinia'
import { useFacebookStore } from './facebook'
import { useImportedDataStore } from './importedData'
import { useScrapeStore } from './scrape'

interface LocationGroup {
  name: string
  locations: Array<{
    address: string
    quantity: number
    stock_status: string
  }>
  campaignId: string
  audienceId: string
  status: 'ACTIVE' | 'INACTIVE'
}

// Matches full state name pattern
const stateNames = {
  Alabama: 'AL',
  Alaska: 'AK',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  Florida: 'FL',
  Georgia: 'GA',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',
}

export const useAdsetGroupsStore = defineStore('adsetGroups', {
  state: () => ({
    creatingGroups: false,
    pushingGroups: false,
    groups: (localStorage.getItem('adsetGroups')
      ? JSON.parse(localStorage.getItem('adsetGroups') || '')
      : []) as LocationGroup[],
    onlyInStock: true,
    dataSource: 'scraped',
  }),

  getters: {
    facebook: () => useFacebookStore(),
    scrapedData: () => useScrapeStore().allResults,
    importedData: () => useImportedDataStore().importedResults,
    currentDataSet(state) {
      return state.dataSource === 'scraped' ? state.scrapedData : state.importedData
    },
  },

  actions: {
    // Extract state from address string
    getStateFromAddress(address: string): string {
      // Matches state abbreviation pattern: ", XX " or ", XX," or ", XX"
      const stateAbbreviationMatch = address.match(/,\s*([A-Z]{2})(?:\s|,|$)/)

      const stateNameMatch = Object.keys(stateNames).find((state) =>
        new RegExp(`\\b${state}\\b`, 'i').test(address),
      )

      if (stateAbbreviationMatch) {
        return stateAbbreviationMatch[1]
      } else if (stateNameMatch) {
        return stateNames[stateNameMatch]
      } else {
        return 'Unknown'
      }
    },

    getStateFromCode(code: string): string {
      return Object.keys(stateNames).find((state) => stateNames[state] === code) || code
    },

    async createGroups() {
      this.creatingGroups = true
      this.groups = []

      console.log(this.currentDataSet)

      // First group by stock status
      const stockGroups = this.currentDataSet.reduce((acc, record) => {
        const key = record.in_stock ? 'in_stock' : 'out_stock'
        if (!acc[key]) acc[key] = []
        acc[key].push(record)
        return acc
      }, {})

      // Create all groups first
      const unsortedGroups = []

      // For each stock status, group by state and then by product
      for (const [stockStatus, stockRecords] of Object.entries(stockGroups)) {
        // Skip out of stock groups if onlyInStock is true
        if (this.onlyInStock && stockStatus === 'out_stock') continue

        // Group records by state
        const stateGroups = stockRecords.reduce((acc, record) => {
          const state = this.getStateFromAddress(record.address)
          // Skip records with "Unknown" state
          if (state === 'Unknown') return acc
          if (!acc[state]) {
            acc[state] = []
          }
          acc[state].push(record)
          return acc
        }, {})

        // For each state, group by product
        for (const [state, stateRecords] of Object.entries(stateGroups)) {
          const productGroups = stateRecords.reduce((acc, record) => {
            const product = record.name || 'Unknown Product' // Default value for undefined product
            if (!acc[product]) {
              acc[product] = []
            }
            acc[product].push(record)
            return acc
          }, {})

          // Create location groups for each product
          for (const [product, productRecords] of Object.entries(productGroups)) {
            const stateName = this.getStateFromCode(state)

            const group = {
              name: `${stateName} - ${product} - ${stockStatus === 'in_stock' ? 'In Stock' : 'Out of Stock'} - ${new Date().toLocaleDateString()}`,
              state,
              campaignId: this.facebook.selectedCampaignId,
              locations: productRecords,
              status: stockStatus === 'in_stock' ? 'ACTIVE' : 'INACTIVE',
            }

            // Find matching audience for this state, product, and status
            const audience = this.facebook.audiences.find((a) => {
              const audienceName = a.name.toLowerCase()
              return (
                // Match state in audience name
                audienceName.includes(state.toLowerCase()) &&
                // Match product in audience name
                audienceName.includes(product.toLowerCase()) &&
                // Match status (in stock/out of stock)
                audienceName.includes(stockStatus === 'in_stock' ? 'in' : 'out')
              )
            })

            // Fallback audience matching just by state and product
            const stateProductAudience = !audience
              ? this.facebook.audiences.find(
                  (a) =>
                    a.name.toLowerCase().includes(state.toLowerCase()) &&
                    a.name.toLowerCase().includes(product.toLowerCase()),
                )
              : null

            // Set audience ID with fallbacks
            group.audienceId =
              audience?.id || stateProductAudience?.id || this.facebook.audiences[0]?.id || ''

            unsortedGroups.push(group)
          }
        }
      }

      // Sort groups by status (ACTIVE first) and then by state
      this.groups = unsortedGroups.sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'ACTIVE' ? -1 : 1
        }
        return a.state.localeCompare(b.state)
      })
      localStorage.setItem('adsetGroups', JSON.stringify(this.groups))

      this.creatingGroups = false
    },

    async clearGroups() {
      this.groups = []
      localStorage.removeItem('adsetGroups')
    },
  },
})
