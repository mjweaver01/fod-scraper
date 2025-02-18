import Scrape from '@/pages/Scrape.vue'
import Login from '@/pages/Login.vue'
import NotFound from '@/pages/404.vue'
import ScrapeFacebook from '@/pages/ScrapeFacebook.vue'
import Automate from '@/pages/Automate.vue'
import Scraper from '@/components/Scraper.vue'
import ImportedFacebook from '@/pages/ImportedFacebook.vue'

export const routes = [
  { path: '/', redirect: '/scrape' },
  { path: '/scrape', component: Scrape, children: [{ path: ':index', component: Scraper }] },
  { path: '/login', component: Login },
  { path: '/scrape-facebook', component: ScrapeFacebook },
  { path: '/imported-facebook', component: ImportedFacebook },
  { path: '/automate', component: Automate },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]
