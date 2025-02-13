<template>
  <nav>
    <router-link to="/"><img src="/fod.png" alt="logo" /></router-link>
    <ul v-if="auth?.authenticated">
      <li>
        <router-link to="/">Scrape</router-link>
      </li>
      <li>
        <router-link to="/facebook">Push</router-link>
      </li>
      <li>
        <router-link to="/automate">Automate</router-link>
      </li>
      <li><a href="#" @click="logout">Logout</a></li>
    </ul>
    <ul v-else>
      <li><router-link to="/login">Login</router-link></li>
    </ul>
  </nav>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  computed: {
    auth() {
      return useAuthStore()
    },
  },
  methods: {
    async logout() {
      await this.auth.logout()
      this.$router.push('/login')
    },
  },
}
</script>

<style lang="scss" scoped>
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);

  img {
    display: block;
    width: 50px;
    height: 44px;
  }

  ul {
    display: flex;
    gap: 1rem;

    li {
      list-style: none;
    }

    a {
      color: var(--text);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
