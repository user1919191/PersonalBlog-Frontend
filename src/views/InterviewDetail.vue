<template>
  <div class="interview-detail" v-loading="loading">
    <div v-if="interview" class="interview-layout">
      <!-- 面经主体 -->
      <div class="interview-container">
        <!-- 头部 -->
        <div class="interview-header">
          <h1 class="interview-title">{{ interview.title }}</h1>
          <div class="interview-meta">
            <span><el-icon><Calendar /></el-icon> {{ formatTime(interview.createTime) }}</span>
            <span><el-icon><View /></el-icon> {{ interview.viewCount }}</span>
            <span><el-icon><ChatDotRound /></el-icon> {{ interview.commentCount }}</span>
          </div>
        </div>

        <!-- 内容（MdPreview） -->
        <MdPreview
          :id="previewId"
          :model-value="interview.content"
          :theme="themeStore.isDark ? 'dark' : 'light'"
          class="interview-preview"
        />

        <!-- 点赞 -->
        <div class="interview-actions">
          <el-button
            :type="liked ? 'primary' : 'default'"
            :icon="liked ? 'StarFilled' : 'Star'"
            @click="handleLike"
            size="large"
          >
            {{ liked ? '已点赞' : '点赞' }} ({{ interview.likeCount }})
          </el-button>
        </div>

        <!-- 评论区 -->
        <div class="comment-section">
          <h3 class="comment-title">评论 ({{ comments.length }})</h3>

          <div v-if="!isUserLoggedIn" class="login-tip">
            <span>登录后才能发表评论</span>
          </div>

          <div v-else class="comment-form">
            <el-input
              v-model="commentContent"
              type="textarea"
              :rows="4"
              placeholder="写下你的评论..."
              maxlength="500"
              show-word-limit
              class="form-textarea"
            />
            <el-button type="primary" @click="submitComment" :loading="submitting">
              发表评论
            </el-button>
          </div>

          <div class="comment-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <el-avatar :src="comment.avatar" :size="36" />
              <div class="comment-body">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.displayName || comment.nickname }}</span>
                  <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
                </div>
                <div class="comment-content">{{ comment.content }}</div>
              </div>
            </div>
            <el-empty v-if="comments.length === 0" description="暂无评论" />
          </div>
        </div>
      </div>

      <!-- 目录 TOC -->
      <div ref="catalogRef" class="catalog-wrap">
        <div class="catalog-title">目录</div>
        <MdCatalog :editor-id="previewId" :scroll-element="scrollElement" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import 'md-editor-v3/lib/style.css'
import { getInterviewById, likeInterview, unlikeInterview, getInterviewComments, createInterviewComment } from '@/api/interview'
import { useAuthStore } from '../store/auth'
import { useThemeStore } from '../store/theme'
import { ElMessage } from 'element-plus'
import { Calendar, View, ChatDotRound } from '@element-plus/icons-vue'
import { loadMdCatalog, loadMdPreview } from '@/utils/md-editor'

const previewId = 'interview-preview'
const scrollElement = document.documentElement

const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const isUserLoggedIn = computed(() => authStore.isUserLoggedIn)
const MdPreview = defineAsyncComponent(loadMdPreview)
const MdCatalog = defineAsyncComponent(loadMdCatalog)

const interview = ref(null)
const comments = ref([])
const loading = ref(false)
const liked = ref(false)
const submitting = ref(false)
const commentContent = ref('')
const catalogRef = ref(null)
let catalogObserver = null

const loadInterview = async () => {
  loading.value = true
  try {
    interview.value = await getInterviewById(route.params.id)
    const likedKey = `liked_interview_${interview.value.id}`
    liked.value = localStorage.getItem(likedKey) === 'true'
  } catch (error) {
    ElMessage.error('加载面经失败')
  } finally {
    loading.value = false
  }
}

const loadComments = async () => {
  try {
    comments.value = await getInterviewComments(route.params.id)
  } catch (error) {
    console.error('加载评论失败', error)
  }
}

const handleLike = async () => {
  try {
    if (liked.value) {
      await unlikeInterview(interview.value.id)
      interview.value.likeCount--
      liked.value = false
      localStorage.removeItem(`liked_interview_${interview.value.id}`)
      ElMessage.success('取消点赞')
    } else {
      await likeInterview(interview.value.id)
      interview.value.likeCount++
      liked.value = true
      localStorage.setItem(`liked_interview_${interview.value.id}`, 'true')
      ElMessage.success('点赞成功')
    }
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

const submitComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  submitting.value = true
  try {
    await createInterviewComment({
      interviewId: interview.value.id,
      content: commentContent.value,
      parentId: 0
    })
    ElMessage.success('评论成功')
    commentContent.value = ''
    interview.value.commentCount++
    loadComments()
  } catch (error) {
    ElMessage.error('评论失败')
  } finally {
    submitting.value = false
  }
}

const formatTime = (time) => new Date(time).toLocaleString('zh-CN')

function scrollCatalogToActive() {
  const container = catalogRef.value
  if (!container) return
  const active = container.querySelector('.md-editor-catalog-active')
  if (!active) return
  const containerRect = container.getBoundingClientRect()
  const activeRect = active.getBoundingClientRect()
  const offset = activeRect.top - containerRect.top + container.scrollTop
  container.scrollTo({
    top: offset - container.clientHeight / 2 + activeRect.height / 2,
    behavior: 'smooth'
  })
}

onMounted(() => {
  loadInterview()
  loadComments()
  nextTick(() => {
    if (catalogRef.value) {
      catalogObserver = new MutationObserver(scrollCatalogToActive)
      catalogObserver.observe(catalogRef.value, {
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
      })
    }
  })
})

onUnmounted(() => {
  catalogObserver?.disconnect()
})
</script>

<style scoped>
.interview-detail {
  width: 100%;
}

.interview-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  width: 100%;
}

.interview-container {
  flex: 1;
  min-width: 0;
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.catalog-wrap {
  width: 220px;
  flex-shrink: 0;
  position: sticky;
  top: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px;
  box-sizing: border-box;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
}

.catalog-title {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.interview-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.interview-title {
  font-size: 32px;
  color: #303133;
  margin-bottom: 15px;
  font-weight: 600;
}

.interview-meta {
  display: flex;
  gap: 20px;
  color: #909399;
  font-size: 14px;
}

.interview-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.interview-preview {
  margin-bottom: 40px;
}

.interview-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  text-align: center;
  padding: 30px 0;
  border-top: 1px solid #e4e7ed;
  border-bottom: 1px solid #e4e7ed;
}

.comment-section {
  margin-top: 40px;
}

.comment-title {
  font-size: 20px;
  margin-bottom: 20px;
  color: #303133;
}

.comment-form {
  margin-bottom: 30px;
}

.form-textarea {
  margin-bottom: 15px;
}

.comment-list {
  margin-top: 20px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 15px;
}

.comment-body {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.login-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 20px;
  color: #909399;
}

.comment-author {
  font-weight: 600;
  color: #409eff;
}

.comment-time {
  color: #909399;
  font-size: 14px;
}

.comment-content {
  color: #606266;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .catalog-wrap {
    display: none;
  }
}
</style>
