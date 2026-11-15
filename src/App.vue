<template>
  <router-view v-if="isAdminRoute" />

  <div v-else id="app">
    <aside class="sidebar">
      <div class="sidebar-profile">
        <div class="blog-name">个人博客</div>
        <div class="blog-desc">记录技术与生活</div>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" :class="{ active: route.path === '/' }">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </router-link>
        <router-link to="/blog" class="nav-item" :class="{ active: route.path.startsWith('/blog') || route.path.startsWith('/article') }">
          <el-icon><Document /></el-icon>
          <span>个人博客</span>
        </router-link>
        <router-link to="/featured" class="nav-item" :class="{ active: route.path === '/featured' }">
          <el-icon><Collection /></el-icon>
          <span>精选文章</span>
        </router-link>
        <router-link to="/interviews" class="nav-item" :class="{ active: route.path.startsWith('/interview') }">
          <el-icon><Notebook /></el-icon>
          <span>面经题库</span>
        </router-link>
        <router-link to="/navs" class="nav-item" :class="{ active: route.path === '/navs' }">
          <el-icon><Link /></el-icon>
          <span>学习网址</span>
        </router-link>
        <router-link to="/forum" class="nav-item" :class="{ active: route.path.startsWith('/forum') }">
          <el-icon><ChatDotRound /></el-icon>
          <span>留言板块</span>
        </router-link>
        <router-link to="/tools" class="nav-item" :class="{ active: route.path === '/tools' }">
          <el-icon><Operation /></el-icon>
          <span>实用工具</span>
        </router-link>
        <router-link v-if="authStore.isUserLoggedIn" to="/favorites" class="nav-item" :class="{ active: route.path.startsWith('/favorites') || route.path.startsWith('/folder') }">
          <el-icon><StarFilled /></el-icon>
          <span>我的收藏</span>
        </router-link>
        <router-link v-if="authStore.isUserLoggedIn" to="/profile" class="nav-item" :class="{ active: route.path.startsWith('/profile') }">
          <el-icon><User /></el-icon>
          <span>个人中心</span>
        </router-link>
      </nav>

      <div class="sidebar-auth">
        <template v-if="!authStore.isUserLoggedIn">
          <div class="oauth-login-btns">
            <el-button class="sidebar-oauth-btn github-sidebar-btn" size="small" @click="handleGithubLogin">GitHub 登录</el-button>
            <el-button class="sidebar-oauth-btn" type="primary" size="small" @click="handleGiteeLogin">Gitee 登录</el-button>
          </div>
        </template>
        <div v-else class="user-info">
          <el-popover
            placement="right-end"
            :width="340"
            trigger="click"
            @show="loadNotifications"
          >
            <template #reference>
              <el-badge :value="unreadCount" :hidden="!unreadCount" class="notice-badge">
                <el-button circle text :icon="Bell" />
              </el-badge>
            </template>
            <div class="notice-panel">
              <div class="notice-header">
                <strong>站内通知</strong>
                <el-button link @click="handleMarkAllRead">全部已读</el-button>
              </div>
              <el-empty v-if="notifications.length === 0" description="暂无通知" :image-size="60" />
              <button
                v-for="item in notifications"
                :key="item.id"
                class="notice-item"
                :class="{ unread: item.isRead !== 1 }"
                @click="openNotification(item)"
              >
                <strong>{{ item.title }}</strong>
                <p>{{ item.content }}</p>
              </button>
            </div>
          </el-popover>
          <span class="user-name">{{ authStore.userInfo?.username }}</span>
          <el-button size="small" @click="handleLogout">退出</el-button>
        </div>
      </div>

      <div class="sidebar-theme">
        <el-button text @click="themeStore.toggleDark()" class="theme-toggle-btn">
          <el-icon size="16"><Sunny v-if="themeStore.isDark" /><Moon v-else /></el-icon>
          <span>{{ themeStore.isDark ? '浅色模式' : '深色模式' }}</span>
        </el-button>
      </div>
    </aside>

    <main class="main-content">
      <router-view />
    </main>

    <el-dialog
      v-model="authStore.showLoginDialog"
      title="登录后继续"
      width="360px"
      :append-to-body="true"
    >
      <div class="login-dialog-actions">
        <el-button class="github-login-btn" @click="handleGithubLogin">GitHub 登录</el-button>
        <el-button type="primary" @click="handleGiteeLogin">Gitee 登录</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { House, Document, Collection, Link, User, Moon, Sunny, ChatDotRound, Notebook, Operation, StarFilled, Bell } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getGiteeAuthUrl, getGithubAuthUrl } from './api/admin'
import { getNotifications, getUnreadNotificationCount, markAllNotificationsRead, markNotificationRead } from './api/user'
import { useAuthStore } from './store/auth'
import { useThemeStore } from './store/theme'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))

const notifications = ref([])
const unreadCount = ref(0)

async function syncUnreadCount() {
  if (!authStore.isUserLoggedIn) {
    unreadCount.value = 0
    notifications.value = []
    return
  }
  try {
    const response = await getUnreadNotificationCount()
    unreadCount.value = response?.count || 0
  } catch (_) {
    unreadCount.value = 0
  }
}

async function loadNotifications() {
  if (!authStore.isUserLoggedIn) return
  try {
    notifications.value = await getNotifications({ limit: 8 })
  } catch (_) {
    notifications.value = []
  }
  await syncUnreadCount()
}

async function openNotification(item) {
  if (item.isRead !== 1) {
    try {
      await markNotificationRead(item.id)
      item.isRead = 1
      unreadCount.value = Math.max(unreadCount.value - 1, 0)
    } catch (_) {
      return
    }
  }
  if (item.link) {
    router.push(item.link)
  }
}

async function handleMarkAllRead() {
  try {
    await markAllNotificationsRead()
    notifications.value = notifications.value.map(item => ({ ...item, isRead: 1 }))
    unreadCount.value = 0
    ElMessage.success('已全部标记为已读')
  } catch (_) {
    ElMessage.error('操作失败')
  }
}

watch(
  () => authStore.isUserLoggedIn,
  loggedIn => {
    if (loggedIn) {
      syncUnreadCount()
    } else {
      notifications.value = []
      unreadCount.value = 0
    }
  },
  { immediate: true }
)

async function handleGithubLogin() {
  authStore.showLoginDialog = false
  sessionStorage.setItem('oauth_redirect', window.location.pathname + window.location.search)
  try {
    const url = await getGithubAuthUrl()
    window.location.href = url
  } catch {
    ElMessage.error('获取授权地址失败')
  }
}

async function handleGiteeLogin() {
  authStore.showLoginDialog = false
  sessionStorage.setItem('oauth_redirect', window.location.pathname + window.location.search)
  try {
    const url = await getGiteeAuthUrl()
    window.location.href = url
  } catch {
    ElMessage.error('获取授权地址失败')
  }
}

async function handleLogout() {
  await authStore.logoutUser()
  ElMessage.success('已退出登录')
  if (route.path === '/profile' || route.path.startsWith('/folder') || route.path.startsWith('/favorites')) {
    router.push('/')
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f0f2f5;
  color: #333;
}

#app {
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  min-height: 100vh;
  background: radial-gradient(circle at top left, rgba(110, 231, 183, 0.18), transparent 28%), linear-gradient(180deg, #0f172a 0%, #12324a 52%, #0f766e 100%);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-profile {
  padding: 32px 20px 24px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
}

.blog-name {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.blog-desc {
  color: rgba(226, 232, 240, 0.68);
  font-size: 12px;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 12px;
  color: rgba(241, 245, 249, 0.72);
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 4px;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: translateX(2px);
}

.nav-item.active {
  background: linear-gradient(135deg, #38bdf8, #14b8a6);
  color: #fff;
  box-shadow: 0 10px 24px rgba(20, 184, 166, 0.28);
}

.nav-item .el-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 16px;
  text-align: center;
  color: rgba(226, 232, 240, 0.42);
  font-size: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.admin-entry {
  color: rgba(241, 245, 249, 0.72);
  transition: color 0.2s;
}

.admin-entry:hover {
  color: #fff;
}

html.dark body {
  background-color: #141414;
  color: #e5eaf3;
}

.sidebar-auth {
  padding: 12px 16px;
}

.login-dialog-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.login-dialog-actions .el-button {
  width: 100%;
  margin-left: 0;
}

.github-login-btn {
  background: #111827;
  border-color: #111827;
  color: #fff;
}

.oauth-login-btns {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-oauth-btn {
  width: 100%;
}

.github-sidebar-btn {
  background: #111827;
  border-color: #111827;
  color: #fff;
}

.github-sidebar-btn:hover {
  background: #1f2937;
  border-color: #1f2937;
  color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: rgba(248, 250, 252, 0.86);
  font-size: 13px;
}

.user-name {
  max-width: 76px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-badge {
  display: inline-flex;
}

.notice-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 360px;
  overflow-y: auto;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notice-item {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  color: inherit;
  cursor: pointer;
}

.notice-item.unread {
  border-color: #14b8a6;
  background: #f0fdfa;
}

.notice-item strong {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
}

.notice-item p {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.5;
}

.main-content {
  margin-left: 220px;
  min-height: 100vh;
  padding: 24px 30px;
  box-sizing: border-box;
}

.sidebar-theme {
  padding: 8px 16px;
}

.theme-toggle-btn {
  width: 100%;
  color: rgba(241, 245, 249, 0.72) !important;
  justify-content: flex-start;
  gap: 8px;
  font-size: 13px;
  border-radius: 12px;
}

.theme-toggle-btn:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

html.dark .main-content {
  background-color: #141414;
}

a {
  text-decoration: none;
  color: inherit;
}
</style>
