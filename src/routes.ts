import Home from '@/pages/Home.vue'
import Login from '@/pages/Login.vue'
import Scrape from '@/pages/Scrape.vue'
import Import from '@/pages/Import.vue'
import ScrapeFacebook from '@/pages/ScrapeFacebook.vue'
import Automate from '@/pages/Automate.vue'
import Scraper from '@/components/Scraper.vue'
import ImportedFacebook from '@/pages/ImportedFacebook.vue'
import AutomatedAdsets from '@/pages/AutomatedAdsets.vue'
import NotFound from '@/pages/404.vue'

export const routes = [
  { path: '/', component: Home },
  { path: '/scrape', component: Scrape, children: [{ path: ':index', component: Scraper }] },
  { path: '/import', component: Import },
  { path: '/login', component: Login },
  { path: '/scrape-facebook', component: ScrapeFacebook },
  { path: '/imported-facebook', component: ImportedFacebook },
  { path: '/automated-adsets', component: AutomatedAdsets },
  { path: '/automate', component: Automate },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

export const navRoutes = [
  { path: '/', name: 'Home' },
  { path: '/import', name: 'Import' },
  { path: '/automated-adsets', name: 'Automated Adsets' },
]
