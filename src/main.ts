import { createApp, markRaw } from 'vue'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { createPinia, setMapStoreSuffix } from 'pinia'
import VueShowdownPlugin from 'vue-showdown'
import './styles/index.scss'
import App from './App.vue'
import { routes } from './routes'
import 'primeicons/primeicons.css'

const router = createRouter({
  history: createWebHistory(),
  routes: routes as RouteRecordRaw[],
})

const pinia = createPinia().use(({ store }) => {
  store.router = markRaw(router)
})
setMapStoreSuffix('')

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(VueShowdownPlugin)

if (import.meta.env.DEV) {
  app.config.errorHandler = (err, instance, info) => {
    console.error('Vue error handler:', err, info)
  }

  app.config.warnHandler = (msg, instance, trace) => {
    console.warn('Vue warning:', msg, trace)
  }
}

app.mount('#app')
