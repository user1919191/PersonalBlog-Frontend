<template>
  <div class="folder-detail">
    <el-page-header @back="$router.back()" :title="folderName">
      <template #content>
        <h2>{{ folderName }}</h2>
      </template>
    </el-page-header>

    <div v-loading="loading" class="items-container">
      <el-empty v-if="items.length === 0" description="收藏夹为空" />
      <div v-else class="items-grid">
        <el-card v-for="item in items" :key="item.id" class="item-card" shadow="hover">
          <div class="item-header">
            <el-tag size="small">{{ getTypeLabel(item.itemType) }}</el-tag>
            <el-button type="danger" size="small" text @click="handleRemove(item.id)">删除</el-button>
          </div>
          <h3 class="item-title" @click="goToDetail(item)">{{ item.title }}</h3>
          <img v-if="item.coverImage" :src="item.coverImage" class="item-cover" />
          <p class="item-time">{{ formatTime(item.createTime) }}</p>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFolders, getFolderItems, removeFavorite } from '../api/user'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const folderId = route.params.id
const folderName = ref(route.query.name || '收藏夹')
const items = ref([])
const loading = ref(false)

onMounted(async () => {
  await Promise.all([loadFolderName(), loadItems()])
})

async function loadFolderName() {
  if (route.query.name) return
  try {
    const folders = await getFolders()
    const matched = (folders || []).find(item => String(item.id) === String(folderId))
    if (matched?.name) {
      folderName.value = matched.name
    }
  } catch (_) {
    // 收藏夹名称仅用于展示，失败时保留默认文案
  }
}

async function loadItems() {
  loading.value = true
  try {
    items.value = await getFolderItems(folderId)
  } catch (e) {
    ElMessage.error('加载收藏项失败，请确认已登录')
  } finally {
    loading.value = false
  }
}

async function handleRemove(itemId) {
  try {
    await removeFavorite(itemId)
    ElMessage.success('已取消收藏')
    items.value = items.value.filter(i => i.id !== itemId)
  } catch {
    ElMessage.error('操作失败')
  }
}

function goToDetail(item) {
  const routes = {
    article: `/article/${item.itemId}`,
    interview: `/interview/${item.itemId}`
  }
  if (item.itemType === 'featured' && item.url) {
    window.open(item.url, '_blank')
    return
  }
  const path = routes[item.itemType]
  if (path) {
    router.push(path)
  }
}

function getTypeLabel(type) {
  return { article: '博客', featured: '精选', interview: '面经' }[type] || type
}

function formatTime(time) {
  return time ? new Date(time).toLocaleDateString() : ''
}
</script>

<style scoped>
.folder-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.items-container {
  margin-top: 30px;
  min-height: 400px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.item-card {
  cursor: pointer;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  margin: 10px 0;
  cursor: pointer;
  color: #303133;
}

.item-title:hover {
  color: #409eff;
}

.item-cover {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  margin: 10px 0;
}

.item-time {
  color: #909399;
  font-size: 13px;
  margin-top: 10px;
}
</style>
