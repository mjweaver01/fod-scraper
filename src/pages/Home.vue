<template>
  <div class="home" v-if="auth?.authenticated">
    <h1>Home</h1>
    <p>Welcome to the FOD Scraper. This is a work in progress.</p>
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
  computed: {
    auth() {
      return useAuthStore()
    },
  },
}
</script>

<style scoped>
.home {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}
</style>
