<template>
  <div class="page facebook-page">
    <h1 v-if="showActions">Push Facebook Audiences - From Import</h1>

    <div class="records">
      <div class="controls top-controls">
        <button
          class="push-all"
          @click="pushAllAudiences"
          :disabled="facebook.pushingAll || displayRecords.length === 0"
          v-if="showActions"
        >
          Push All Audiences
        </button>
        <ImportButton />
        <button
          v-if="importedData.importedResults.length"
          @click="importedData.clearImportedResults"
        >
          Clear Imported Results
        </button>
      </div>
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
            <label for="sortDropdown">Sort by Stock Status</label>
            <div class="select">
              <select id="sortDropdown" v-model="selectedSort">
                <option value="none">None</option>
                <option value="inFirst">In Stock First</option>
                <option value="outFirst">Out of Stock First</option>
              </select>
            </div>
          </div>
          <div class="filter-dropdown">
            <label for="stockFilterDropdown">Filter by Stock</label>
            <div class="select">
              <select id="stockFilterDropdown" v-model="selectedStockFilter">
                <option value="all">All</option>
                <option value="in">In Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </div>
          <div class="sort-dropdown">
            <label for="quantitySortDropdown">Sort by Quantity</label>
            <div class="select">
              <select id="quantitySortDropdown" v-model="selectedQuantitySort">
                <option value="none">None</option>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
          <div
            v-if="
              selectedStockFilter !== 'all' ||
              searchTerm !== '' ||
              selectedSort !== 'none' ||
              selectedQuantitySort !== 'none'
            "
          >
            <button @click="resetFilters">Reset</button>
          </div>
        </div>
      </div>

      <div class="records-table-container">
        <table v-if="displayRecords.length" class="records-table">
          <thead>
            <tr>
              <th>Store</th>
              <th>Product</th>
              <th>Address</th>
              <th>Stock Status</th>
              <th>Quantity</th>
              <th v-if="showActions">Actions</th>
              <th v-if="showActions">Response</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(record, index) in displayRecords" :key="index">
              <tr>
                <td>{{ record.store }}</td>
                <td>{{ record.name }}</td>
                <td>{{ record.address || 'No address provided' }}</td>
                <td>
                  <span
                    class="pill stock-status"
                    :class="record.stock_status === 'In Stock' ? 'good' : 'bad'"
                  >
                    {{ record.stock_status }}
                  </span>
                </td>
                <td>{{ record.quantity }}</td>
                <td v-if="showActions">
                  <div class="actions">
                    <button
                      @click="facebook.pushAudience(index, record)"
                      :disabled="
                        facebook.pushingAll ||
                        (facebook.pushStatus[index] && facebook.pushStatus[index].loading)
                      "
                    >
                      Push Audience
                    </button>
                    <button
                      :class="{ hover: isAccordionOpen(index) }"
                      @click="toggleAccordion(index)"
                      :disabled="facebook.pushingAll"
                    >
                      {{ isAccordionOpen(index) ? 'Hide' : 'Show' }} Config
                    </button>
                  </div>
                </td>
                <td v-if="showActions" class="response-container">
                  <div
                    v-if="facebook.pushStatus[index] && facebook.pushStatus[index].response"
                    class="response"
                    :class="facebook.pushStatus[index].response.error ? 'error' : 'success'"
                  >
                    <p class="small no-margin">{{ facebook.pushStatus[index].response.message }}</p>
                  </div>
                  <div v-if="facebook.pushStatus[index] && facebook.pushStatus[index].loading">
                    <p class="small no-margin">Pushing...</p>
                  </div>
                </td>
              </tr>
              <tr v-if="isAccordionOpen(index)" class="accordion-content">
                <td colspan="7">
                  <AdsetConfig
                    :record="record"
                    :modelValue="facebook.recordConfigs[record.address.toLocaleString()]"
                    :disabled="facebook.pushingAll"
                    @update:modelValue="
                      (val) => (facebook.recordConfigs[record.address.toLocaleString()] = val)
                    "
                  />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
        <div v-else>
          <p>No imported records available.</p>
        </div>
      </div>

      <div class="campaigns">
        <label for="campaignSelect">Select Campaign</label>
        <select id="campaignSelect" v-model="facebookStore.selectedCampaign">
          <option
            v-for="campaign in facebookStore.campaigns"
            :key="campaign.id"
            :value="campaign.id"
          >
            {{ campaign.name }}
          </option>
        </select>
      </div>

      <div class="promoted-pages">
        <label for="pageSelect">Select Promoted Page</label>
        <select id="pageSelect" v-model="facebookStore.selectedPage">
          <option v-for="page in facebookStore.promotedPages" :key="page.id" :value="page.id">
            {{ page.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import { useImportedDataStore } from '@/stores/importedData'
import { useFacebookStore } from '@/stores/facebook'
import AdsetConfig from '@/components/AdsetConfig.vue'
import ImportButton from '@/components/ImportButton.vue'

export default {
  name: 'ImportedFacebook',
  components: {
    AdsetConfig,
    ImportButton,
  },
  props: {
    showActions: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      searchTerm: '',
      selectedSort: 'none',
      selectedStockFilter: 'all',
      selectedQuantitySort: 'none',
      accordionState: {},
    }
  },
  setup() {
    const facebookStore = useFacebookStore()

    // Fetch campaigns and promoted pages when the component is mounted
    facebookStore.fetchAllCampaigns()
    facebookStore.fetchPromotedPages()

    return {
      facebookStore,
    }
  },
  computed: {
    importedData() {
      return useImportedDataStore()
    },
    facebook() {
      return useFacebookStore()
    },
    filteredRecords() {
      // Access the data directly from the store
      const recordsWithIndex = this.importedData.importedResults.flatMap((result, index) => ({
        ...result,
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
    displayRecords() {
      let records = this.filteredRecords

      // Apply filter dropdown for In Stock / Out of Stock.
      if (this.selectedStockFilter === 'in') {
        records = records.filter((record) => record.in_stock)
      } else if (this.selectedStockFilter === 'out') {
        records = records.filter((record) => !record.in_stock)
      }

      // Apply sorting dropdown for stock status.
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

      // Apply sorting for quantity.
      if (this.selectedQuantitySort === 'asc') {
        records = records.slice().sort((a, b) => a.quantity - b.quantity)
      } else if (this.selectedQuantitySort === 'desc') {
        records = records.slice().sort((a, b) => b.quantity - a.quantity)
      }

      return records
    },
  },
  methods: {
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
    resetFilters() {
      this.searchTerm = ''
      this.selectedSort = 'none'
      this.selectedStockFilter = 'all'
      this.selectedQuantitySort = 'none'
    },
    pushAllAudiences() {
      if (alert('Are you sure you want to push all audiences?')) {
        this.facebook.pushAllAudiences(this.displayRecords)
      }
    },
  },
  watch: {
    'importedData.importedResults': {
      handler(newRecords) {
        // Initialize record-specific configuration in the Facebook store if not already set.
        newRecords.forEach((record) => {
          if (!this.facebook.recordConfigs[record.address.toLocaleString()]) {
            const presetStatus = record.in_stock ? 'ACTIVE' : 'INACTIVE'
            this.facebook.recordConfigs[record.address.toLocaleString()] = {
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
  flex-flow: column;
  gap: 1em;
  justify-content: space-between;
  align-items: flex-end;

  .sort-dropdown,
  .filter-dropdown {
    display: flex;
    flex-flow: column;
  }

  @media (min-width: $tablet) {
    flex-flow: row;
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
  align-items: flex-end;
  width: 100%;

  > div {
    flex-grow: 1;
  }

  label {
    white-space: nowrap;
  }
}

.records {
  margin-bottom: 2rem;
}

.top-controls {
  flex-wrap: wrap;

  > button {
    flex-grow: 1;
    flex-basis: 5%;
    white-space: nowrap;
  }
}

.records-table-container {
  overflow-x: auto;
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

.actions {
  display: flex;
  gap: 0.5rem;
}

.records-table button {
  padding: 0.25rem;
  font-size: 0.8rem;
  white-space: nowrap;
  width: 100%;
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

.error {
  color: var(--red);
}

.success {
  color: var(--green);
}

.global-loading {
  margin: 1rem 0;
  font-weight: bold;
}
</style>
