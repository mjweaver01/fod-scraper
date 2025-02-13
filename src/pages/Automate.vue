<template>
  <div class="automate-page">
    <h1>Automation Scheduler</h1>
    <div class="cron-config">
      <label for="cron">CRON Expression:</label>
      <input id="cron" v-model="cronExpression" type="text" placeholder="* * * * *" />
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
import { ref } from 'vue'
import { useScrapeStore } from '@/stores/scrape'

export default {
  name: 'Automate',
  setup() {
    const cronExpression = ref(localStorage.getItem('automationCron') || '* * * * *')
    const running = ref(false)
    const message = ref('')
    const scrapeStore = useScrapeStore()

    // Save the CRON expression so that you (or your backend) can use it later.
    const updateSchedule = () => {
      localStorage.setItem('automationCron', cronExpression.value)
      message.value = `Schedule updated to: ${cronExpression.value}`
    }

    // Run the automation workflow: first scrape sites, then push all audiences.
    const runAutomation = async () => {
      running.value = true
      message.value = 'Starting automation...'
      try {
        // Scrape sites using the same method as in Scrape.vue.
        await scrapeStore.scrapeSites()
        // Filter for records with a valid address.
        const scrapedRecords = scrapeStore.allResults.filter(
          (record) => record.address && record.address.trim() !== '',
        )
        if (!scrapedRecords.length) {
          message.value = 'No valid records found after scraping.'
          running.value = false
          return
        }

        // Default configuration similar to the one used in Facebook.vue.
        const defaultConfig = {
          optimization_goal: 'REACH',
          billing_event: 'IMPRESSIONS',
          bid_amount: 200,
          daily_budget: 500,
          campaign_id: '',
          status: 'INACTIVE',
          promoted_object: { page_id: '' },
          radius: 5,
          distance_unit: 'mile',
        }

        // Build a configuration for each record.
        const recordConfigs = scrapedRecords.map((record) => ({
          ...defaultConfig,
          status: record.in_stock ? 'ACTIVE' : 'INACTIVE',
        }))

        // Push audiences in parallel.
        const pushPromises = scrapedRecords.map((record, index) => {
          const config = recordConfigs[index]
          const payload = {
            name: record.store + ' Audience',
            optimization_goal: config.optimization_goal,
            billing_event: config.billing_event,
            bid_amount: config.bid_amount,
            daily_budget: config.daily_budget,
            campaign_id: config.campaign_id,
            targeting: {
              geo_locations: {
                custom_locations: [
                  {
                    address_string: record.address,
                    radius: config.radius,
                    distance_unit: config.distance_unit,
                  },
                ],
              },
            },
            status: config.status,
            promoted_object: {
              page_id: config.promoted_object.page_id,
            },
          }
          return fetch('/.netlify/functions/push-to-facebook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }).then((res) => res.json())
        })

        const pushResults = await Promise.all(pushPromises)
        console.log('Push responses:', pushResults)
        message.value = 'Automation completed successfully.'
      } catch (error) {
        console.error(error)
        message.value = 'Automation failed: ' + error.message
      } finally {
        running.value = false
      }
    }

    return {
      cronExpression,
      running,
      message,
      updateSchedule,
      runAutomation,
    }
  },
}
</script>

<style scoped>
.automate-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}
.cron-config {
  margin-bottom: 1.5rem;
}
.cron-config input {
  margin-right: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
}
.actions button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}
.message {
  margin-top: 1rem;
  font-size: 1.1rem;
}
</style>
