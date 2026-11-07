// 最轻量认证状态：localStorage + 本模块（按拍板方案，不引入 Pinia）
const TOKEN_KEY = 'aim_token'
const USER_KEY = 'aim_user'

export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user ?? {}))
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || '{}')
  } catch {
    return {}
  }
}

export function isLoggedIn() {
  return !!getToken()
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
