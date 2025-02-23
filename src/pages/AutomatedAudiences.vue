<template>
  <div class="page automated-audiences-page">
    <h1>Automated Audience Groups</h1>

    <hr />
    <div class="controls">
      <button
        @click="audienceGroups.createGroups"
        :disabled="!hasRecords || audienceGroups.creatingGroups"
      >
        {{ audienceGroups.creatingGroups ? 'Creating Groups...' : 'Create Audience Groups' }}
      </button>
      <button
        @click="audienceGroups.clearGroups"
        :disabled="!hasGroups || audienceGroups.pushingGroups"
      >
        Clear All Groups
      </button>
      <button
        @click="audienceGroups.pushGroupsToFacebook"
        :disabled="!hasGroups || audienceGroups.pushingGroups || true"
      >
        {{ audienceGroups.pushingGroups ? 'Pushing Groups...' : 'Push All Groups' }}
      </button>
      <SliderToggle
        :value="audienceGroups.onlyInStock"
        label="Only create audiences for in-stock products"
      />
    </div>
    <hr />

    <div v-if="audienceGroups.groups.length" class="search-filter">
      <div class="search">
        <input type="search" placeholder="Search groups..." v-model="searchTerm" />
      </div>

      <div class="controls nested-controls">
        <div class="sort-dropdown">
          <label for="sortDropdown">Sort by Status</label>
          <div class="select">
            <select id="sortDropdown" v-model="selectedSort">
              <option value="none">None</option>
              <option value="activeFirst">Active First</option>
              <option value="inactiveFirst">Inactive First</option>
            </select>
          </div>
        </div>
        <div class="filter-dropdown">
          <label for="statusFilterDropdown">Filter by Status</label>
          <div class="select">
            <select id="statusFilterDropdown" v-model="selectedStatusFilter">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div class="sort-dropdown">
          <label for="locationsSortDropdown">Sort by Locations</label>
          <div class="select">
            <select id="locationsSortDropdown" v-model="selectedLocationsSort">
              <option value="none">None</option>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
        <div v-if="hasActiveFilters">
          <button @click="resetFilters" class="btn">Reset</button>
        </div>
      </div>
    </div>

    <div v-if="audienceGroups.groups.length" class="groups">
      <div v-for="group in displayGroups" :key="group.state + group.status" class="group-card">
        <div class="group-header">
          <h3>{{ group.name }}</h3>
          <span :class="['pill', group.status.toLowerCase()]">
            {{ group.status }}
          </span>
        </div>

        <div class="group-details">
          <p><strong>State:</strong> {{ group.state }}</p>
          <p><strong>Total Locations:</strong> {{ group.locations.length }}</p>
        </div>

        <div class="locations-list">
          <div class="locations-table">
            <table>
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Zip Code</th>
                  <th>Quantity</th>
                  <th>Stock Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="location in group.locations" :key="location.address">
                  <td>{{ location.address }}</td>
                  <td>{{ location.zipCode }}</td>
                  <td>{{ location.quantity }}</td>
                  <td>
                    {{ location.stock_status }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!hasRecords" class="no-records mt-4">
      <p>No records available. Please import data first.</p>
    </div>

    <div v-else class="no-groups mt-4">
      <p>Click 'Create Audience Groups' to generate groups from your data.</p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useAudienceGroupsStore } from '@/stores/audienceGroups'
import { useFacebookStore } from '@/stores/facebook'
import { useImportedDataStore } from '@/stores/importedData'
import SliderToggle from '@/components/SliderToggle.vue'

export default {
  name: 'AutomatedAudiences',

  components: {
    SliderToggle,
  },

  data() {
    return {
      searchTerm: '',
      selectedSort: 'none',
      selectedStatusFilter: 'all',
      selectedLocationsSort: 'none',
    }
  },

  mounted() {
    // Fetch audiences instead of campaigns
    this.facebook.fetchAudiences()
    this.facebook.fetchCampaigns()
    this.facebook.fetchCustomAudiences()
    this.facebook.fetchAdSets()
  },

  computed: {
    importedData() {
      return useImportedDataStore()
    },
    facebook() {
      return useFacebookStore()
    },
    audienceGroups() {
      return useAudienceGroupsStore()
    },

    hasRecords() {
      return this.importedData.importedResults.length > 0
    },

    hasGroups() {
      return this.audienceGroups.groups.length > 0
    },

    hasActiveFilters() {
      return (
        this.selectedStatusFilter !== 'all' ||
        this.searchTerm !== '' ||
        this.selectedSort !== 'none' ||
        this.selectedLocationsSort !== 'none'
      )
    },

    filteredGroups() {
      let groups = this.audienceGroups.groups

      if (this.searchTerm.trim()) {
        const search = this.searchTerm.trim().toLowerCase()
        groups = groups.filter((group) => {
          return (
            this.fuzzyMatch(search, group.name) ||
            this.fuzzyMatch(search, group.state) ||
            this.fuzzyMatch(search, group.status)
          )
        })
      }

      return groups
    },

    displayGroups() {
      let groups = this.filteredGroups

      // Apply status filter
      if (this.selectedStatusFilter !== 'all') {
        const isActive = this.selectedStatusFilter === 'active'
        groups = groups.filter((group) => (group.status.toLowerCase() === 'active') === isActive)
      }

      // Apply status sorting
      if (this.selectedSort === 'activeFirst') {
        groups = [...groups].sort((a, b) => {
          if (a.status === b.status) return 0
          return a.status.toLowerCase() === 'active' ? -1 : 1
        })
      } else if (this.selectedSort === 'inactiveFirst') {
        groups = [...groups].sort((a, b) => {
          if (a.status === b.status) return 0
          return a.status.toLowerCase() === 'active' ? 1 : -1
        })
      }

      // Apply locations count sorting
      if (this.selectedLocationsSort !== 'none') {
        groups = [...groups].sort((a, b) => {
          const diff = a.locations.length - b.locations.length
          return this.selectedLocationsSort === 'asc' ? diff : -diff
        })
      }

      return groups
    },
  },

  methods: {
    getCampaignName(id) {
      return this.facebook.campaigns.find((c) => c.id === id)?.name || 'Unknown Campaign'
    },

    fuzzyMatch(query, text) {
      if (!text) return false
      text = text.toString().toLowerCase()
      let queryIndex = 0
      for (let i = 0; i < text.length && queryIndex < query.length; i++) {
        if (text[i] === query[queryIndex]) {
          queryIndex++
        }
      }
      return queryIndex === query.length
    },

    resetFilters() {
      this.searchTerm = ''
      this.selectedSort = 'none'
      this.selectedStatusFilter = 'all'
      this.selectedLocationsSort = 'none'
    },
  },
}
</script>

<style lang="scss" scoped>
.automated-audiences {
  padding: 1em;
}

.group-card {
  border: 1px solid var(--border-color);
  border-radius: 0.5em;
  margin-bottom: 1em;
  padding: 1em;
  background: var(--background);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1em;
}

.pill {
  margin: 0;
}

.group-details {
  margin-bottom: 1em;
}

.locations-list {
  margin-top: 1em;
}

.locations-table {
  overflow: auto;
  max-height: 245px;

  thead {
    position: sticky;
    top: 0;
  }
}

table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }

  th {
    background-color: var(--light-gray);
    font-weight: 600;
  }
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.search-filter {
  display: flex;
  flex-flow: column;
  gap: 1em;
  justify-content: space-between;
  align-items: flex-end;
  margin: 1em 0;
}

.search {
  width: 100%;
}

.nested-controls {
  align-items: flex-end;

  > div {
    flex-grow: 1;
  }
}

.sort-dropdown,
.filter-dropdown {
  display: flex;
  flex-flow: column;
}

@media (min-width: 768px) {
  .search-filter {
    flex-flow: row;
  }
}
</style>
