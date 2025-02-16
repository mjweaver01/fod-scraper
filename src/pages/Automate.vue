<template>
  <div class="page automate-page">
    <h1>Automation Scheduler</h1>
    <div class="cron-config">
      <div>
        <label for="cron">CRON Expression</label>
        <input id="cron" v-model="cronExpression" type="text" placeholder="* * * * *" />
      </div>
      <button @click="updateSchedule">Save Schedule</button>
    </div>
    <div class="actions">
      <button @click="runAutomation" :disabled="running">
        {{ running ? 'Running automation...' : 'Run Automation Now' }}
      </button>
    </div>
    <div class="message" v-if="message">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { useScrapeStore } from '@/stores/scrape'
import { useFacebookStore } from '@/stores/facebook'

export default {
  name: 'Automate',
  data() {
    return {
      cronExpression: localStorage.getItem('automationCron') || '* * * * *',
      running: false,
      message: '',
    }
  },
  methods: {
    updateSchedule() {
      localStorage.setItem('automationCron', this.cronExpression)
      this.message = `Schedule updated to: ${this.cronExpression}`
      // TODO: Update the schedule in a database.
    },

    async runAutomation() {
      this.running = true
      this.message = 'Starting automation...'

      // Get the stores from Pinia.
      const scrapeStore = useScrapeStore()
      const facebookStore = useFacebookStore()

      try {
        // Scrape sites as in the Scrape.vue component.
        await scrapeStore.scrapeSites()

        // Filter scraped records with a valid address.
        const scrapedRecords = scrapeStore.allResults.filter(
          (record) => record.address && record.address.trim() !== '',
        )
        if (!scrapedRecords.length) {
          this.message = 'No valid records found after scraping.'
          this.running = false
          return
        }

        // Initialize record-specific configuration in the Facebook store.
        scrapedRecords.forEach((record, index) => {
          if (!facebookStore.recordConfigs[index]) {
            const presetStatus = record.in_stock ? 'ACTIVE' : 'INACTIVE'
            facebookStore.recordConfigs[index] = {
              ...facebookStore.defaultConfig,
              status: presetStatus,
            }
          }
        })

        // Push all audiences using the Facebook store.
        await facebookStore.pushAllAudiences(scrapedRecords)
        this.message = 'Automation completed successfully.'
      } catch (error) {
        console.error(error)
        this.message = 'Automation failed: ' + error.message
      } finally {
        this.running = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.cron-config {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1rem;

  > div {
    width: 100%;
  }

  button {
    white-space: nowrap;
  }
}
</style>
