<template>
  <div class="forum-list">
    <!-- 顶部操作栏 -->
    <div class="forum-header">
      <div class="forum-title-row">
        <h2 class="forum-title">社区论坛</h2>
        <el-button v-if="isLoggedIn" type="primary" @click="showPostDialog = true">
          <el-icon><Edit /></el-icon> 发帖
        </el-button>
        <el-tooltip v-else content="登录后才能发帖" placement="top">
          <el-button type="primary" disabled>
            <el-icon><Edit /></el-icon> 发帖
          </el-button>
        </el-tooltip>
      </div>
      <el-input
        v-model="keyword"
        placeholder="搜索帖子..."
        clearable
        @keyup.enter="handleSearch"
        @clear="handleSearch"
        class="search-input"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
    </div>

    <!-- 骨架屏 -->
    <div v-if="loading">
      <div v-for="i in 8" :key="i" class="post-card skeleton-card">
        <el-skeleton animated>
          <template #template>
            <el-skeleton-item variant="h3" style="width: 60%; margin-bottom: 10px" />
            <div style="display: flex; gap: 16px">
              <el-skeleton-item variant="text" style="width: 80px" />
              <el-skeleton-item variant="text" style="width: 60px" />
              <el-skeleton-item variant="text" style="width: 60px" />
            </div>
          </template>
        </el-skeleton>
      </div>
    </div>

    <!-- 帖子列表 -->
    <div v-else>
      <el-empty v-if="posts.length === 0" description="暂无帖子，来发第一帖吧！" />
      <div
        v-for="post in posts"
        :key="post.id"
        class="post-card"
        @click="goToDetail(post.id)"
      >
        <div class="post-main">
          <div class="post-title-row">
            <el-tag v-if="post.isTop" type="danger" size="small">置顶</el-tag>
            <span class="post-title">{{ post.title }}</span>
          </div>
          <div class="post-meta">
            <el-avatar :src="post.authorAvatar" :size="20" />
            <span class="post-author">{{ post.authorName }}</span>
            <span class="meta-divider">·</span>
            <el-icon><Calendar /></el-icon>
            <span>{{ formatDate(post.createTime) }}</span>
          </div>
        </div>
        <div class="post-stats">
          <span class="stat-item"><el-icon><View /></el-icon> {{ post.viewCount }}</span>
          <span class="stat-item"><el-icon><ChatDotRound /></el-icon> {{ post.replyCount }}</span>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <el-pagination
      v-if="total > 0"
      v-model:current-page="pageNum"
      v-model:page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      @current-change="loadPosts"
      class="pagination"
    />

    <!-- 发帖弹窗 -->
    <el-dialog v-model="showPostDialog" title="发布帖子" width="600px" :close-on-click-modal="false">
      <el-form :model="postForm" label-position="top">
        <el-form-item label="标题">
          <el-input v-model="postForm.title" placeholder="请输入标题（5~200字符）" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="postForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入内容（10~10000字符）"
            maxlength="10000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPostDialog = false">取消</el-button>
        <el-button type="primary" @click="submitPost" :loading="posting">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getForumPosts, createForumPost } from '@/api/forum'
import { useAuthStore } from '../store/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isUserLoggedIn)

const posts = ref([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(15)
const keyword = ref('')
const showPostDialog = ref(false)
const posting = ref(false)
const postForm = ref({ title: '', content: '' })

const loadPosts = async () => {
  loading.value = true
  try {
    const data = await getForumPosts({ pageNum: pageNum.value, pageSize: pageSize.value, keyword: keyword.value })
    posts.value = data.records
    total.value = data.total
  } catch {
    ElMessage.error('加载帖子失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pageNum.value = 1
  loadPosts()
}

const goToDetail = (id) => {
  router.push(`/forum/${id}`)
}

const submitPost = async () => {
  const { title, content } = postForm.value
  if (!title.trim() || title.trim().length < 5) {
    ElMessage.warning('标题至少 5 个字符')
    return
  }
  if (!content.trim() || content.trim().length < 10) {
    ElMessage.warning('内容至少 10 个字符')
    return
  }
  posting.value = true
  try {
    const result = await createForumPost({ title: title.trim(), content: content.trim() })
    ElMessage.success('发帖成功')
    showPostDialog.value = false
    postForm.value = { title: '', content: '' }
    router.push(`/forum/${result.id}`)
  } catch (e) {
    ElMessage.error(e.message || '发帖失败')
  } finally {
    posting.value = false
  }
}

const formatDate = (time) => time ? new Date(time).toLocaleDateString('zh-CN') : ''

onMounted(loadPosts)
</script>

<style scoped>
.forum-list {
  width: 100%;
}

.forum-header {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.forum-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.forum-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a2332;
  margin: 0;
}

.search-input {
  width: 100%;
}

.post-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 18px 24px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  border: 1px solid transparent;
}

.post-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.12);
  transform: translateY(-1px);
}

.skeleton-card {
  cursor: default;
  border: none;
}
.skeleton-card:hover {
  transform: none;
  border-color: transparent;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.post-main {
  flex: 1;
  min-width: 0;
}

.post-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a2332;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
}

.post-author {
  color: #606266;
  font-weight: 500;
}

.meta-divider {
  color: #dcdfe6;
}

.post-stats {
  display: flex;
  gap: 16px;
  flex-shrink: 0;
  margin-left: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
