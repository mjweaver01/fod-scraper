import { acceptHMRUpdate, defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => {
    return {
      password: '',
      loggingIn: false,
      authenticated: false,
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
      } else {
        alert(authed.message)
        this.loggingIn = false
        this.password = ''
        this.authenticated = false
      }
    },
    async logout() {
      this.authenticated = false
      this.password = ''
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
