<template>
  <nav>
    <router-link to="/"><img src="/fod.png" alt="logo" /></router-link>
    <ul v-if="auth?.authenticated">
      <li v-for="route in navRoutes" :key="route.path">
        <router-link :to="route.path" activeClass="active">{{ route.name }}</router-link>
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
import { navRoutes } from '@/routes'
export default {
  name: 'Nav',
  data() {
    return {
      navRoutes,
    }
  },
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
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--border-color);

  img {
    display: block;
    width: 50px;
    height: 44px;
  }

  ul {
    display: flex;
    gap: 1rem;
    margin: 0;

    li {
      list-style: none;
    }

    a {
      color: var(--text);
      text-decoration: none;

      &:hover,
      &.active {
        text-decoration: underline;
      }
    }
  }
}
</style>
