import Scrape from '@/pages/Scrape.vue'
import Login from '@/pages/Login.vue'
import NotFound from '@/pages/404.vue'
import Facebook from '@/pages/Facebook.vue'

export const routes = [
  { path: '/', redirect: '/scrape' },
  { path: '/scrape', component: Scrape },
  { path: '/login', component: Login },
  { path: '/facebook', component: Facebook },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]
