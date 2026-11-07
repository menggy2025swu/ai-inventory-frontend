import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, clearAuth } from '@/auth'
import router from '@/router'

// 后端地址固定 8080；CORS 只允许 Authorization 与 Content-Type 两个头，
// axios 默认不加自定义头，FormData 的 Content-Type 交给浏览器自动带 boundary
const request = axios.create({
  baseURL: '',   // 留空
  timeout: 30000
})
request.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：成功统一取 data；失败按后端 {code,message,timestamp} 提示；
// 401 统一登出跳登录（但登录接口自身的 401 是"用户名或密码错误"，只提示不跳转）
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const resp = error.response
    const message =
      resp?.data?.message || error.message || '网络错误，请稍后重试'

    if (resp?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/api/auth/login')
      if (isLoginRequest) {
        ElMessage.error(message)
      } else {
        clearAuth()
        ElMessage.error('登录已失效，请重新登录')
        if (router.currentRoute.value.path !== '/login') {
          router.push({
            path: '/login',
            query: { redirect: router.currentRoute.value.fullPath }
          })
        }
      }
    } else if (!error.config?.skipErrorToast) {
      // 调用方可通过 { skipErrorToast: true } 关闭统一错误提示，
      // 用于批量导入等"单条失败静默跳过"的场景（Promise 依旧 reject）
      ElMessage.error(message)
    }
    // 继续 reject，页面可感知请求失败（避免加载态卡死/白屏）
    return Promise.reject(error)
  }
)

export default request
