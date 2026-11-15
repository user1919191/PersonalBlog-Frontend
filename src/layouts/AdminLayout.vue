<template>
  <div class="admin-wrapper">
    <aside class="admin-sidebar">
      <div class="admin-logo">
        <el-icon size="20"><Setting /></el-icon>
        <span>Blog Admin</span>
      </div>

      <nav class="admin-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="admin-nav-item"
          :class="{ active: route.path.startsWith(item.path) || (item.path === '/admin/dashboard' && route.path === '/admin') }"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
    </aside>

    <div class="admin-main">
      <header class="admin-header">
        <div class="header-title">{{ pageTitle }}</div>
        <div class="header-right">
          <el-button text title="返回前台" @click="router.push('/')">
            <el-icon size="18"><House /></el-icon>
          </el-button>
          <el-button text @click="themeStore.toggleDark()" title="Toggle theme">
            <el-icon size="18"><Sunny v-if="themeStore.isDark" /><Moon v-else /></el-icon>
          </el-button>
          <span class="admin-username">
            <el-icon><UserFilled /></el-icon>
            {{ authStore.adminUser?.username || 'Admin' }}
          </span>
          <el-button type="danger" size="small" text @click="handleLogout">Logout</el-button>
        </div>
      </header>

      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import {
  ChatDotRound,
  Collection,
  DataAnalysis,
  Document,
  Files,
  House,
  Link,
  Memo,
  Moon,
  PriceTag,
  Setting,
  Sunny,
  Tickets,
  User,
  UserFilled
} from '@element-plus/icons-vue'
import { useAuthStore } from '../store/auth'
import { useThemeStore } from '../store/theme'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: DataAnalysis },
  { path: '/admin/categories', label: 'Categories', icon: Files },
  { path: '/admin/series', label: 'Series', icon: Tickets },
  { path: '/admin/articles', label: 'Articles', icon: Document },
  { path: '/admin/featured', label: 'Featured', icon: Collection },
  { path: '/admin/interviews', label: 'Interviews', icon: Memo },
  { path: '/admin/navs', label: 'Nav Sites', icon: Link },
  { path: '/admin/tags', label: 'Tags', icon: PriceTag },
  { path: '/admin/forum', label: 'Forum', icon: ChatDotRound },
  { path: '/admin/users', label: 'Users', icon: User }
]

const pageTitleMap = Object.fromEntries(navItems.map(item => [item.path, item.label]))

const pageTitle = computed(() => {
  for (const item of navItems) {
    if (route.path.startsWith(item.path)) {
      return pageTitleMap[item.path]
    }
  }
  return 'Admin'
})

async function handleLogout() {
  await ElMessageBox.confirm('Confirm logout?', 'Warning', { type: 'warning' })
  authStore.logout()
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-wrapper {
  display: flex;
  width: 100%;
  min-height: 100vh;
  background: #f5f6fa;
  overflow-x: hidden;
}

.admin-sidebar {
  width: 208px;
  min-height: 100vh;
  background: #1e2a3a;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
}

.admin-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px 16px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-nav {
  flex: 1;
  padding: 12px 10px;
}

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.64);
  text-decoration: none;
  font-size: 13px;
  margin-bottom: 2px;
  transition: all 0.2s;
}

.admin-nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.admin-nav-item.active {
  background: #409eff;
  color: #fff;
}

.admin-main {
  margin-left: 208px;
  flex: 1;
  min-width: 0;
  width: calc(100% - 208px);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.admin-header {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e8eaed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-username {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}

.admin-content {
  flex: 1;
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: auto;
}
</style>
