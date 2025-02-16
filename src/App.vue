<template>
  <div class="app-wrapper">
    <div class="app-header">
      <Nav />
    </div>
    <div class="app">
      <RouterView v-if="auth?.authenticated || $route.path === '/login'" />
    </div>
    <ChatPopup />
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import Nav from '@/components/Nav.vue'
import ChatPopup from '@/components/ChatPopup.vue'

export default {
  components: {
    Nav,
    ChatPopup,
  },
  async beforeMount() {
    await this.checkAuth()
  },
  watch: {
    '$route.path': {
      handler() {
        this.checkAuth()
      },
      immediate: true,
    },
  },
  computed: {
    auth() {
      return useAuthStore()
    },
  },
  methods: {
    async checkAuth() {
      await this.auth?.authUser()
      if (!this.auth?.authenticated) {
        this.$router.push('/login')
      } else if (this.auth?.error) {
        alert(this.auth?.error)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.app {
  height: 100%;
  width: 100%;
  overflow: scroll;
  padding: 1rem;
}
</style>
