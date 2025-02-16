<template>
  <div class="top login-page">
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
    <div class="login-error" v-if="triedLogin">{{ auth?.error }}</div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  data() {
    return {
      triedLogin: false,
    }
  },
  computed: {
    auth() {
      return useAuthStore()
    },
  },
  methods: {
    async login() {
      this.triedLogin = true

      await this.auth?.authUser()
      if (this.auth?.authenticated) {
        this.$router.push('/')
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
  margin-top: 1em;
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
