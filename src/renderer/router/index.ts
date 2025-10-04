import { createWebHistory, createRouter, createWebHashHistory } from 'vue-router'

import HomeView from '@/renderer/pages/Home/index.vue'
import EnvEdit from '@/renderer/pages/EnvEdit/index.vue'
import AppEdit from '@/renderer/pages/AppEdit/index.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    name: 'EnvEdit',
    path: '/env',
    component: EnvEdit,
    props: true,
  },
  {
    name: 'AppEdit',
    path: '/app-edit/:appId?',
    component: AppEdit,
    props: true,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})



export default router