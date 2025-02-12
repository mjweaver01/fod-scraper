<template>
  <div class="top login-page">
    <Hero />
    <div class="login-form">
      <h1>Login</h1>
      <form @submit.prevent="login">
        <input
          id="password-input"
          name="password"
          placeholder="Password"
          type="password"
          v-model="auth.password"
          :disabled="auth?.loggingIn"
        />
        <button type="submit">Log in</button>
      </form>
    </div>
  </div>
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
    async login() {
      await this.auth?.authUser()
      if (this.auth?.authenticated) {
        this.$router.push('/')
      } else {
        alert(authed?.message ?? 'Could not log in')
      }
    },
  },
}
</script>

<style scoped>
.login-page {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.login-form form {
  display: flex;
  flex-flow: column;
  gap: 1em;
}

.login-error {
  color: var(--red);
  margin: 0;
  text-align: center;
}

.reset-password {
  text-align: center;
}

.reset-password a {
  color: var(--blue);
  text-decoration: underline;
  cursor: pointer;
}
</style>
