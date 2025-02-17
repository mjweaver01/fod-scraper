<template>
  <div class="page scrape-page">
    <div class="scrape-header">
      <h1 class="no-margin">Scrape ({{ scrape.sites.length }})</h1>
      <div class="pill scrape-status" :class="computeStatus(scrape.status)">
        {{ scrape.status }}
      </div>
    </div>
    <div class="scrape-controls">
      <button @click="scrape.scrapeSites()" :disabled="scrape.scraping">Scrape All Sites</button>
      <button
        v-if="scrape.results.length > 0"
        :disabled="scrape.scraping || true"
        @click="scrape.saveToDB"
      >
        Save to DB
      </button>
    </div>

    <TabContent :tabs="tabHeaders" />
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { useScrapeStore } from '@/stores/scrape'
import Scraper from '@/components/Scraper.vue'
import TabContent from '@/components/TabContent.vue'

export default {
  name: 'Scrape',
  components: {
    Scraper,
    TabContent,
  },
  mounted() {
    this.scrape.activeTab =
      typeof this.$route.params.index === 'undefined' || this.$route.params.index === 'undefined'
        ? 0
        : this.$route.params.index

    this.$router.push(`/scrape/${this.scrape.activeTab}`)
  },
  computed: {
    scrape() {
      return useScrapeStore()
    },
    tabHeaders() {
      return this.scrape.sites.map((site, index) => ({
        id: index,
        title: site.name,
        path: `/scrape/${index}`,
      }))
    },
  },
  methods: {
    computeStatus(status) {
      if (!status) return ''

      if (status === 'scraping') {
        return 'warning'
      } else if (status === 'saved') {
        return 'good'
      }
    },
  },
  watch: {
    '$route.params.index'(sentIndex) {
      if (typeof sentIndex === 'undefined' || sentIndex === 'undefined') {
        this.$router.push(`/scrape/0`)
      } else {
        this.scrape.activeTab = sentIndex
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.scrape-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.scrape-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.scrape-status {
  margin: 0;
}
</style>
