import { acceptHMRUpdate, defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => {
    return {
      password: localStorage.getItem('password') || '',
      loggingIn: false,
      authenticated: false,
      error: null,
    }
  },
  actions: {
    async authUser() {
      const authed = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        body: JSON.stringify({ password: this.password }),
      }).then((res) => res.json())

      if (authed.code === 200) {
        this.loggingIn = false
        this.authenticated = true
        this.error = null
        localStorage.setItem('password', this.password)
      } else {
        this.loggingIn = false
        this.password = ''
        this.authenticated = false
        this.error = authed.message
      }
    },
    async logout() {
      this.authenticated = false
      this.password = ''
      this.error = null
      localStorage.removeItem('password')
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
