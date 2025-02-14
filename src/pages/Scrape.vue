<template>
  <div class="page scrape-page">
    <Scraper />
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import Scraper from '@/components/Scraper.vue'

export default {
  name: 'Home',
  components: {
    Scraper,
  },
}
</script>
