import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/cases',
    name: 'CaseList',
    component: () => import('../views/CaseList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/cases/:id',
    name: 'CaseDetail',
    component: () => import('../views/CaseDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/Reports.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/classes',
    name: 'Classes',
    component: () => import('../views/Classes.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/classes/:id',
    name: 'ClassDetail',
    component: () => import('../views/ClassDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/experiments',
    name: 'Experiments',
    component: () => import('../views/Experiments.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/experiments/:id',
    name: 'ExperimentDetail',
    component: () => import('../views/ExperimentDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { requiresAuth: false },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && auth.isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router
