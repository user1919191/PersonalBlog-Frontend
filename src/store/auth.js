import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { logoutUser as logoutUserApi } from '../api/admin'
import { useResourceCacheStore } from './resource-cache'

export const useAuthStore = defineStore('auth', () => {
  // 管理员认证
  const adminToken = ref(localStorage.getItem('admin_token') || '')
  const adminUser = ref(JSON.parse(localStorage.getItem('admin_user') || 'null'))

  // 前端用户认证
  const userToken = ref(localStorage.getItem('user_token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('user_info') || 'null'))

  const isAdminLoggedIn = computed(() => !!adminToken.value)
  const isUserLoggedIn = computed(() => !!userToken.value)

  // Item 5：全局控制登录弹窗的开关
  const showLoginDialog = ref(false)

  function setAuth(tokenVal, userVal) {
    adminToken.value = tokenVal
    adminUser.value = userVal
    localStorage.setItem('admin_token', tokenVal)
    localStorage.setItem('admin_user', JSON.stringify(userVal))
  }

  function setUserAuth(tokenVal, userVal) {
    const resourceCacheStore = useResourceCacheStore()
    userToken.value = tokenVal
    userInfo.value = userVal
    localStorage.setItem('user_token', tokenVal)
    localStorage.setItem('user_info', JSON.stringify(userVal))
    resourceCacheStore.clearUserScopedCache()
  }

  function logout() {
    adminToken.value = ''
    adminUser.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  }

  async function logoutUser() {
    const resourceCacheStore = useResourceCacheStore()
    try { await logoutUserApi() } catch (_) {}
    userToken.value = ''
    userInfo.value = null
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_info')
    resourceCacheStore.clearUserScopedCache()
  }

  return {
    adminToken, adminUser, isAdminLoggedIn, setAuth, logout,
    userToken, userInfo, isUserLoggedIn, setUserAuth, logoutUser,
    showLoginDialog
  }
})
