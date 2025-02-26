<template>
  <div class="page automated-adsets-page">
    <h1>Automated Adsets</h1>

    <hr />
    <div class="controls">
      <button
        @click="adsetGroups.createGroups"
        :disabled="!hasRecords || adsetGroups.creatingGroups"
      >
        {{ adsetGroups.creatingGroups ? 'Creating Groups...' : 'Create Groups' }}
      </button>
      <button @click="adsetGroups.clearGroups" :disabled="!hasGroups || adsetGroups.pushingGroups">
        Clear All Groups
      </button>
      <button @click="facebook.pushAllAdsets" :disabled="!hasGroups || facebook.pushingAll">
        {{ facebook.pushingAll ? 'Pushing Groups...' : 'Push All Groups' }}
      </button>
    </div>
    <hr />

    <div class="controls">
      <div>
        <label for="campaignSelect">Data Source</label>
        <div class="select">
          <select v-model="adsetGroups.dataSource" @change="adsetGroups.clearGroups">
            <option value="" disabled selected>Select Data Source</option>
            <option value="scraped">Scraped</option>
            <option value="imported">Imported</option>
          </select>
        </div>
      </div>
      <div>
        <label for="campaignSelect">Campaign</label>
        <div class="select">
          <select v-model="facebook.selectedCampaignId" @change="adsetGroups.clearGroups">
            <option value="" disabled selected>Select Campaign</option>
            <option v-for="campaign in facebook.campaigns" :key="campaign.id" :value="campaign.id">
              {{ campaign.name }}
            </option>
          </select>
        </div>
      </div>
      <SliderToggle
        v-model="adsetGroups.onlyInStock"
        @update:modelValue="adsetGroups.clearGroups"
        label="Only generate in-stock adsets"
        labelMaxWidth="110px"
      />
    </div>
    <hr />

    <div v-if="adsetGroups.groups.length" class="search-filter">
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

    <div v-if="adsetGroups.groups.length" class="groups">
      <div
        v-for="(group, index) in displayGroups"
        :key="group.state + group.status"
        class="group-card"
      >
        <div class="group-header">
          <h3>{{ group.name }}</h3>
          <span
            :class="[
              'pill',
              group.status.toLowerCase(),
              liveAdsets.find((adset) => adset.name === group.name) ? 'really-good' : '',
            ]"
          >
            {{ liveAdsets.find((adset) => adset.name === group.name) ? 'PUSHED' : group.status }}
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
                  <th>Quantity</th>
                  <th>Stock Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="location in group.locations" :key="location.address">
                  <td>{{ location.address }}</td>
                  <td>{{ location.quantity }}</td>
                  <td>
                    {{ location.stock_status }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="controls">
          <div class="controls">
            <button
              @click="createAndPushAdset(index, group)"
              :disabled="facebook.pushStatus[index]?.loading"
            >
              {{ liveAdsets.find((adset) => adset.name === group.name) ? 'Update' : 'Push' }}
              {{ group.name.split(' - ')[0] }}
              {{
                group.name
                  .split(' - ')[1]
                  .replace('Field of Dreams', '')
                  .replace('Field Of Dreams', '')
              }}
            </button>
            <p
              v-if="facebook.pushStatus[index]"
              class="pill"
              :class="
                facebook.pushStatus[index]?.error || facebook.pushStatus[index]?.response?.error
                  ? 'error'
                  : facebook.pushStatus[index]?.response
                    ? 'success'
                    : ''
              "
            >
              {{
                facebook.pushStatus[index]?.loading
                  ? 'Loading...'
                  : (facebook.pushStatus[index]?.response?.message ??
                    facebook.pushStatus[index]?.response ??
                    facebook.pushStatus[index]?.error)
              }}
            </p>
          </div>
          <div
            v-if="liveAdsets.find((adset) => adset.name === group.name)"
            class="controls flex-end"
          >
            <button class="destructive" @click="deleteAdset(index)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!hasRecords" class="no-records mt-4">
      <p>No records available. Please import data first.</p>
    </div>

    <div v-else class="no-groups mt-4">
      <p>Click 'Create Groups' to generate groups from your data.</p>
    </div>
  </div>
</template>

<script>
import { useAdsetGroupsStore } from '@/stores/adsetGroups'
import { useFacebookStore } from '@/stores/facebook'
import { useImportedDataStore } from '@/stores/importedData'
import SliderToggle from '@/components/SliderToggle.vue'

export default {
  name: 'AutomatedAdsets',

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

  async mounted() {
    await this.facebook.fetchCampaigns()
    this.facebook.selectedCampaignId = this.facebook.campaigns[0].id

    await this.facebook.fetchAdSets()
  },

  computed: {
    importedData() {
      return useImportedDataStore()
    },
    facebook() {
      return useFacebookStore()
    },
    adsetGroups() {
      return useAdsetGroupsStore()
    },

    hasRecords() {
      return this.adsetGroups.currentDataSet.length > 0
    },

    hasGroups() {
      return this.adsetGroups.groups.length > 0
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
      let groups = this.adsetGroups.groups

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

    liveAdsets() {
      return (
        this.facebook?.adSets?.filter((adset) =>
          this.adsetGroups.groups.some((group) => group.name === adset.name),
        ) || []
      )
    },
  },

  methods: {
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

    createAndPushAdset(index, group) {
      if (this.liveAdsets.find((adset) => adset.name === group.name)) {
        const existingAdset = this.liveAdsets.find((adset) => adset.name === group.name)
        this.facebook.updateAdset(index, group, existingAdset.id)
      } else {
        this.facebook.pushAdset(index, group)
      }
    },

    deleteAdset(index) {
      if (!confirm('Are you sure you want to delete this adset?')) return

      this.facebook.deleteAdset(
        index,
        this.liveAdsets.find((adset) => adset.name === this.adsetGroups.groups[index].name).id,
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.automated-adsets {
  padding: 1em;
}

.group-card {
  border: 1px solid var(--border-color);
  border-radius: 0.5em;
  margin-bottom: 1em;
  padding: 1em;
  background: var(--background);

  .controls {
    align-items: center;
  }
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
  margin: 1em 0;
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
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  width: 100%;

  > div {
    flex-grow: 1;
  }

  @media (min-width: $tablet) {
    flex-wrap: nowrap;

    > div {
      flex-grow: 0;
    }

    .select {
      max-width: 200px;
    }

    .flex-end {
      justify-content: flex-end;
      flex-basis: 20%;
    }
  }
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
