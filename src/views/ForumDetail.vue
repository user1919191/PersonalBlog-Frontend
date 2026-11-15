<template>
  <div class="forum-detail">
    <!-- 返回按钮 -->
    <div class="back-btn" @click="$router.push('/forum')">
      <el-icon><ArrowLeft /></el-icon> 返回论坛
    </div>

    <!-- 骨架屏 -->
    <div v-if="loading" class="post-container">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="h1" style="width: 70%; height: 32px; margin-bottom: 16px" />
          <div style="display: flex; gap: 16px; margin-bottom: 24px">
            <el-skeleton-item variant="text" style="width: 100px" />
            <el-skeleton-item variant="text" style="width: 80px" />
          </div>
          <el-skeleton-item variant="text" v-for="i in 10" :key="i" style="width: 100%; margin-bottom: 8px" />
        </template>
      </el-skeleton>
    </div>

    <div v-else-if="post">
      <!-- 帖子主体 -->
      <div class="post-container">
        <div class="post-header">
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-meta">
            <el-avatar :src="post.authorAvatar" :size="28" />
            <span class="author-name">{{ post.authorName }}</span>
            <span class="meta-sep">·</span>
            <el-icon><Calendar /></el-icon>
            <span>{{ formatTime(post.createTime) }}</span>
            <span class="meta-sep">·</span>
            <el-icon><View /></el-icon>
            <span>{{ post.viewCount }} 浏览</span>
            <span class="meta-sep">·</span>
            <el-icon><ChatDotRound /></el-icon>
            <span>{{ post.replyCount }} 回复</span>
          </div>
        </div>
        <div class="post-content">{{ post.content }}</div>

        <!-- 发帖人操作 -->
        <div v-if="canDelete(post.userId)" class="post-actions">
          <el-button type="danger" size="small" plain @click="handleDeletePost">删除帖子</el-button>
        </div>
      </div>

      <!-- 回复列表 -->
      <div class="reply-section">
        <h3 class="reply-title">{{ replyTree.length }} 条回复</h3>

        <el-empty v-if="replyTree.length === 0" description="暂无回复" />

        <div v-for="reply in replyTree" :key="reply.id" class="reply-thread">
          <!-- 主回复 -->
          <div class="reply-item">
            <el-avatar :src="reply.authorAvatar" :size="36" />
            <div class="reply-body">
              <div class="reply-header">
                <span class="reply-author">{{ reply.authorName }}</span>
                <span class="reply-time">{{ formatTime(reply.createTime) }}</span>
              </div>
              <div class="reply-content">{{ reply.content }}</div>
              <div class="reply-footer">
                <span class="reply-btn" @click="setReplyTarget(reply)">回复</span>
                <span v-if="canDelete(reply.userId)" class="delete-btn" @click="handleDeleteReply(reply.id)">删除</span>
              </div>
            </div>
          </div>

          <!-- 子回复 -->
          <div v-if="reply.children && reply.children.length > 0" class="sub-reply-list">
            <div
              v-for="sub in visibleReplies(reply)"
              :key="sub.id"
              class="reply-item sub-reply"
            >
              <el-avatar :src="sub.authorAvatar" :size="28" />
              <div class="reply-body">
                <div class="reply-header">
                  <span class="reply-author">{{ sub.authorName }}</span>
                  <span class="reply-time">{{ formatTime(sub.createTime) }}</span>
                </div>
                <div class="reply-content">{{ sub.content }}</div>
                <div class="reply-footer">
                  <span class="reply-btn" @click="setReplyTarget(sub)">回复</span>
                  <span v-if="canDelete(sub.userId)" class="delete-btn" @click="handleDeleteReply(sub.id)">删除</span>
                </div>
              </div>
            </div>
            <div
              v-if="reply.children.length > COLLAPSE_THRESHOLD"
              class="expand-btn"
              @click="toggleExpand(reply.id)"
            >
              <el-icon><ArrowDown v-if="!isExpanded(reply.id)" /><ArrowUp v-else /></el-icon>
              {{ isExpanded(reply.id) ? '收起' : `展开 ${reply.children.length - COLLAPSE_THRESHOLD} 条` }}
            </div>
          </div>
        </div>
      </div>

      <!-- 回复表单 -->
      <div class="reply-form-wrap" v-if="isLoggedIn">
        <div v-if="replyTarget" class="reply-target-hint">
          回复 <strong>{{ replyTarget.authorName }}</strong>：
          <el-button link type="primary" size="small" @click="replyTarget = null">取消</el-button>
        </div>
        <el-input
          v-model="replyContent"
          type="textarea"
          :rows="3"
          :placeholder="replyTarget ? `回复 @${replyTarget.authorName}...` : '写下你的回复...'"
          maxlength="2000"
          show-word-limit
        />
        <el-button type="primary" @click="submitReply" :loading="submitting" style="margin-top:10px">
          {{ replyTarget ? '回复' : '发表回复' }}
        </el-button>
      </div>
      <div v-else class="login-tip">
        <el-icon><Lock /></el-icon>
        <span>登录后才能回复</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getForumPostById, createForumReply, deleteForumPost, deleteForumReply } from '@/api/forum'
import { useAuthStore } from '../store/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'

const COLLAPSE_THRESHOLD = 3

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isUserLoggedIn)
const currentUserId = computed(() => authStore.userInfo?.id)
const isAdmin = computed(() => authStore.userInfo?.role === 'ADMIN')

const post = ref(null)
const loading = ref(false)
const replyContent = ref('')
const replyTarget = ref(null)
const submitting = ref(false)
const expandedReplies = ref([])

const replyTree = computed(() => {
  const replies = post.value?.replies || []
  const map = new Map()
  const roots = []
  replies.forEach(r => map.set(r.id, { ...r, children: [] }))
  replies.forEach(r => {
    const node = map.get(r.id)
    if (r.parentId && r.parentId !== 0 && map.has(r.parentId)) {
      map.get(r.parentId).children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
})

const isExpanded = (id) => expandedReplies.value.includes(id)
const toggleExpand = (id) => {
  const idx = expandedReplies.value.indexOf(id)
  if (idx > -1) expandedReplies.value.splice(idx, 1)
  else expandedReplies.value.push(id)
}
const visibleReplies = (reply) => {
  if (isExpanded(reply.id) || reply.children.length <= COLLAPSE_THRESHOLD) return reply.children
  return reply.children.slice(0, COLLAPSE_THRESHOLD)
}

const canDelete = (userId) => isAdmin.value || currentUserId.value === userId

const loadPost = async () => {
  loading.value = true
  try {
    post.value = await getForumPostById(route.params.id)
  } catch {
    ElMessage.error('加载帖子失败')
    router.push('/forum')
  } finally {
    loading.value = false
  }
}

const setReplyTarget = (reply) => {
  replyTarget.value = reply
  document.querySelector('.reply-form-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const submitReply = async () => {
  const content = replyContent.value.trim()
  if (!content || content.length < 2) {
    ElMessage.warning('回复内容至少 2 个字符')
    return
  }
  submitting.value = true
  try {
    const data = {
      postId: post.value.id,
      content,
      parentId: replyTarget.value?.id || 0
    }
    const newReply = await createForumReply(data)
    ElMessage.success('回复成功')
    replyContent.value = ''
    replyTarget.value = null
    post.value.replies = [...(post.value.replies || []), newReply]
    post.value.replyCount++
  } catch (e) {
    ElMessage.error(e.message || '回复失败')
  } finally {
    submitting.value = false
  }
}

const handleDeletePost = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个帖子吗？', '提示', { type: 'warning' })
    await deleteForumPost(post.value.id)
    ElMessage.success('删除成功')
    router.push('/forum')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.message || '删除失败')
  }
}

const handleDeleteReply = async (replyId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条回复吗？', '提示', { type: 'warning' })
    await deleteForumReply(replyId)
    ElMessage.success('删除成功')
    post.value.replies = post.value.replies.filter(r => r.id !== replyId)
    post.value.replyCount = Math.max(0, post.value.replyCount - 1)
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.message || '删除失败')
  }
}

const formatTime = (time) => time ? new Date(time).toLocaleString('zh-CN') : ''

onMounted(loadPost)
</script>

<style scoped>
.forum-detail { width: 100%; }

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #409eff;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 16px;
  padding: 4px 0;
}
.back-btn:hover { text-decoration: underline; }

.post-container {
  background: #fff;
  border-radius: 12px;
  padding: 32px 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.post-header { margin-bottom: 24px; }

.post-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a2332;
  margin-bottom: 12px;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 14px;
  flex-wrap: wrap;
}

.author-name { color: #409eff; font-weight: 500; }
.meta-sep { color: #dcdfe6; }

.post-content {
  color: #303133;
  line-height: 1.8;
  font-size: 15px;
  white-space: pre-wrap;
  word-break: break-word;
}

.post-actions {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 回复区 */
.reply-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.reply-title {
  font-size: 18px;
  color: #1a2332;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.reply-thread { margin-bottom: 16px; }

.reply-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: 8px;
  background: #f8f9fb;
}

.reply-body { flex: 1; }

.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.reply-author { font-weight: 600; color: #409eff; }
.reply-time { color: #909399; font-size: 13px; }
.reply-content { color: #303133; line-height: 1.7; white-space: pre-wrap; word-break: break-word; }

.reply-footer {
  margin-top: 8px;
  display: flex;
  gap: 12px;
}

.reply-btn {
  font-size: 13px;
  color: #909399;
  cursor: pointer;
}
.reply-btn:hover { color: #409eff; }

.delete-btn {
  font-size: 13px;
  color: #f56c6c;
  cursor: pointer;
}
.delete-btn:hover { opacity: 0.8; }

.sub-reply-list {
  margin-left: 48px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sub-reply {
  background: #f0f2f5;
  border-left: 3px solid #dcdfe6;
  border-radius: 0 8px 8px 0;
  padding: 10px 14px;
}

.expand-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #409eff;
  font-size: 13px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 4px;
  transition: background 0.2s;
}
.expand-btn:hover { background: #ecf5ff; }

/* 回复表单 */
.reply-form-wrap {
  background: #fff;
  border-radius: 12px;
  padding: 24px 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.reply-target-hint {
  font-size: 13px;
  color: #606266;
  margin-bottom: 10px;
  padding: 6px 10px;
  background: #f0f7ff;
  border-radius: 4px;
}

.login-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  color: #909399;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>
