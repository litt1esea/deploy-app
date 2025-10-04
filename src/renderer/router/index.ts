import { createWebHistory, createRouter, createWebHashHistory } from 'vue-router'

import HomeView from '@/renderer/pages/Home/index.vue'
import EnvEdit from '@/renderer/pages/EnvEdit/index.vue'
import AddApplication from '@/renderer/pages/AddApplication/index.vue'

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
    name: 'AddApplication',
    path: '/add-application',
    component: AddApplication,
    props: true,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})



export default router