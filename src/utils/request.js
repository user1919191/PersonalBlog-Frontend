import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

function isAdminApi(url = '') {
  return url.startsWith('/admin/')
    || url === '/auth/login'
    || url.startsWith('/auth/admin/')
    || url === '/series/admin'
    || url.startsWith('/series/admin/')
}

// 需要登录才能调用的用户接口（与后端 SessionAuthInterceptor 的拦截范围保持一致）
function isAuthRequired(url = '', method = 'get') {
  if (url.startsWith('/user/')) {
    return true
  }
  // 公共浏览接口（评论/面经评论/论坛帖子列表与详情）无需登录
  if (method.toLowerCase() === 'get') {
    return false
  }
  return url.startsWith('/comments')
    || url.startsWith('/interview-comments')
    || url.startsWith('/forum/posts')
    || url.startsWith('/forum/replies')
}

// 请求拦截：注入 JWT token，无 token 时静默拦截需要认证的请求
request.interceptors.request.use(config => {
  const url = config.url || ''
  // 管理后台接口用 admin_token，其他接口用 user_token
  if (isAdminApi(url)) {
    const adminToken = localStorage.getItem('admin_token')
    if (adminToken) {
      config.headers['Authorization'] = 'Bearer ' + adminToken
    }
  } else {
    const userToken = localStorage.getItem('user_token')
    if (userToken) {
      config.headers['Authorization'] = 'Bearer ' + userToken
    } else if (isAuthRequired(url, config.method)) {
      // 未登录时直接拦截，不发请求，避免无意义的 401
      return Promise.reject({ __silent: true })
    }
  }
  return config
})

// 响应拦截
request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res.data
  },
  error => {
    // 未登录时静默拦截的请求，不弹错误提示
    if (error?.__silent) {
      return Promise.reject(error)
    }
    if (error.response?.status === 401) {
      if (window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        window.location.href = '/admin/login'
      } else {
        // Item 5：清除过期 token，弹出登录框而非只提示
        localStorage.removeItem('user_token')
        localStorage.removeItem('user_info')
        // 动态引入 authStore，避免模块初始化时 Pinia 尚未就绪
        import('../store/auth').then(({ useAuthStore }) => {
          useAuthStore().showLoginDialog = true
        })
      }
      return Promise.reject(error)
    }
    ElMessage.error(error.response?.data?.message || error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
