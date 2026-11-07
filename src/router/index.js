import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn } from '@/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true, title: '登录' }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { public: true, title: '注册' }
  },
  {
    path: '/',
    component: () => import('@/layout/AppLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { title: '仪表盘' }
      },
      {
        path: 'items',
        name: 'items',
        component: () => import('@/views/ItemsView.vue'),
        meta: { title: '物品管理' }
      },
      // ---- 占位路由：下一轮实现，不接后端 ----
      {
        path: 'categories',
        name: 'categories',
        component: () => import('@/views/CategoriesView.vue'),
        meta: { title: '分类管理' }
      },
      {
        path: 'locations',
        name: 'locations',
        component: () => import('@/views/LocationsView.vue'),
        meta: { title: '位置管理' }
      },
      {
        path: 'ai/intake',
        name: 'ai-intake',
        component: () => import('@/views/AiIntakeView.vue'),
        meta: { title: 'AI 智能录入' }
      },
      {
        path: 'ai/organize',
        name: 'ai-organize',
        component: () => import('@/views/AiOrganizeView.vue'),
        meta: { title: 'AI 自动整理' }
      },
      {
        path: 'ai/search',
        name: 'ai-search',
        component: () => import('@/views/AiSearchView.vue'),
        meta: { title: 'AI 找物' }
      }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：未登录访问受保护页 → /login（带 redirect 回跳）；
// 已登录访问 /login|/register → 首页。
// 注意：Token 真伪不在此处校验（本地无法验证签名），
// 由 AppLayout 挂载后的 GET /api/items 探测 + 响应拦截器 401 登出兜底。
router.beforeEach((to) => {
  if (to.meta.public && isLoggedIn()) {
    return { path: '/' }
  }
  if (!to.meta.public && !isLoggedIn()) {
    return {
      path: '/login',
      query: to.fullPath === '/' ? {} : { redirect: to.fullPath }
    }
  }
  return true
})

export default router
