<template>
  <div>
    <!-- 搜索工具栏 -->
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索标题/内容"
        clearable
        style="width: 240px"
        @keyup.enter="loadList"
        @clear="loadList"
      />
      <el-select v-model="statusFilter" placeholder="帖子状态" clearable style="width: 120px" @change="loadList">
        <el-option :value="1" label="正常" />
        <el-option :value="0" label="已删除" />
      </el-select>
      <el-button type="primary" @click="loadList">搜索</el-button>
    </div>

    <!-- 帖子表格 -->
    <el-table :data="posts" v-loading="loading" border stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="authorName" label="作者" width="110" show-overflow-tooltip />
      <el-table-column prop="replyCount" label="回复" width="70" align="center" />
      <el-table-column prop="viewCount" label="浏览" width="70" align="center" />
      <el-table-column label="置顶" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isTop === 1 ? 'danger' : 'info'" size="small">
            {{ row.isTop === 1 ? '置顶' : '普通' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '正常' : '已删除' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="发帖时间" width="150" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link size="small" type="info" @click="openReplies(row)">查看回复</el-button>
          <el-button
            link size="small"
            :type="row.isTop === 1 ? 'warning' : 'primary'"
            @click="handleToggleTop(row)"
          >{{ row.isTop === 1 ? '取消置顶' : '置顶' }}</el-button>
          <el-button
            link size="small"
            :type="row.status === 1 ? 'danger' : 'success'"
            @click="handleToggleStatus(row)"
          >{{ row.status === 1 ? '删除' : '恢复' }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pageNum"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      class="pagination"
      @size-change="loadList"
      @current-change="loadList"
    />

    <!-- 回复管理抽屉 -->
    <el-drawer
      v-model="replyDrawer"
      :title="`回复管理 — ${currentPost?.title || ''}`"
      size="600px"
      direction="rtl"
    >
      <div v-if="repliesLoading" style="text-align:center;padding:40px">
        <el-icon class="is-loading" :size="28"><Loading /></el-icon>
      </div>
      <template v-else>
        <div v-if="replies.length === 0" style="color:#999;text-align:center;padding:40px">暂无回复</div>
        <div v-for="r in replies" :key="r.id" class="reply-item" :class="{ deleted: r.status === 0 }">
          <div class="reply-header">
            <span class="reply-author">{{ r.authorName || r.userId }}</span>
            <span class="reply-time">{{ r.createTime }}</span>
            <el-tag v-if="r.status === 0" type="danger" size="small" style="margin-left:8px">已删除</el-tag>
            <el-tag v-if="r.parentId && r.parentId !== 0" type="info" size="small" style="margin-left:8px">楼中楼</el-tag>
            <el-button
              v-if="r.status === 1"
              link type="danger" size="small"
              style="margin-left:auto"
              @click="handleDeleteReply(r)"
            >删除</el-button>
          </div>
          <div class="reply-content">{{ r.content }}</div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import request from '../../utils/request'

const posts        = ref([])
const loading      = ref(false)
const keyword      = ref('')
const statusFilter = ref(null)
const pageNum      = ref(1)
const pageSize     = ref(20)
const total        = ref(0)

// 回复抽屉
const replyDrawer   = ref(false)
const currentPost   = ref(null)
const replies       = ref([])
const repliesLoading = ref(false)

async function loadList() {
  loading.value = true
  try {
    const params = { pageNum: pageNum.value, pageSize: pageSize.value }
    if (keyword.value) params.keyword = keyword.value
    if (statusFilter.value !== null && statusFilter.value !== undefined)
      params.status = statusFilter.value
    const res = await request({ url: '/admin/forum/posts', method: 'get', params })
    posts.value = res.records
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function handleToggleTop(row) {
  await request({ url: `/admin/forum/posts/${row.id}/top`, method: 'patch' })
  row.isTop = row.isTop === 1 ? 0 : 1
  ElMessage.success(row.isTop === 1 ? '已置顶' : '已取消置顶')
}

async function handleToggleStatus(row) {
  const isDel = row.status === 1
  await ElMessageBox.confirm(
    isDel ? `确认删除帖子「${row.title}」？` : `确认恢复帖子「${row.title}」？`,
    isDel ? '删除确认' : '恢复确认',
    { type: isDel ? 'warning' : 'info' }
  )
  const newStatus = isDel ? 0 : 1
  await request({ url: `/admin/forum/posts/${row.id}/status`, method: 'patch', params: { status: newStatus } })
  row.status = newStatus
  ElMessage.success(isDel ? '已删除' : '已恢复')
}

async function openReplies(row) {
  currentPost.value = row
  replyDrawer.value = true
  repliesLoading.value = true
  try {
    replies.value = await request({ url: `/admin/forum/posts/${row.id}/replies`, method: 'get' })
  } finally {
    repliesLoading.value = false
  }
}

async function handleDeleteReply(r) {
  await ElMessageBox.confirm(`确认删除该条回复？`, '删除确认', { type: 'warning' })
  await request({ url: `/admin/forum/replies/${r.id}`, method: 'delete' })
  r.status = 0
  // 同步更新表格中帖子的回复数
  const post = posts.value.find(p => p.id === r.postId)
  if (post && post.replyCount > 0) post.replyCount--
  ElMessage.success('回复已删除')
}

onMounted(loadList)
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
.reply-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px 14px;
  margin-bottom: 10px;
  transition: opacity 0.2s;
}
.reply-item.deleted {
  opacity: 0.5;
  background: #fafafa;
}
.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
}
.reply-author {
  font-weight: 600;
  color: #303133;
}
.reply-time {
  color: #909399;
  font-size: 12px;
}
.reply-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
