<template>
  <div class="home" v-if="auth?.authenticated">
    <h1>Home</h1>
    <p>Welcome to the FOD Scraper. This is a work in progress.</p>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'Home',
  computed: {
    auth() {
      return useAuthStore()
    },
  },
}
</script>

<style scoped></style>
