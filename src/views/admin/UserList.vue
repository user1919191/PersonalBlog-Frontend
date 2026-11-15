<template>
  <div>
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索用户名 / 显示名 / 邮箱"
        clearable
        style="width: 260px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <span class="toolbar-total">共 {{ total }} 位用户</span>
    </div>

    <el-table :data="users" v-loading="loading" stripe style="width: 100%; margin-top: 12px">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="用户" min-width="160">
        <template #default="{ row }">
          <div class="user-cell">
            <el-avatar :size="28" :src="row.avatar || undefined" />
            <div>
              <div class="username">{{ row.username }}</div>
              <div class="displayname">{{ row.displayName || '-' }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" min-width="150" show-overflow-tooltip />
      <el-table-column label="注册方式" width="100">
        <template #default="{ row }">
          <el-tag size="small" type="info">{{ row.oauthProvider || '密码' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="在线 Session" width="110" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.sessionCount > 0 ? 'success' : 'info'">
            {{ row.sessionCount }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="注册时间" width="160" />
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '正常' : '封禁' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 1">
            <el-popconfirm
              title="封禁后该用户会立即下线，确认操作？"
              confirm-button-text="确认封禁"
              cancel-button-text="取消"
              confirm-button-type="danger"
              @confirm="handleStatus(row, 0)"
            >
              <template #reference>
                <el-button type="danger" size="small" text>封禁</el-button>
              </template>
            </el-popconfirm>
          </template>
          <template v-else>
            <el-button type="success" size="small" text @click="handleStatus(row, 1)">解封</el-button>
          </template>
          <el-button
            type="warning"
            size="small"
            text
            :disabled="row.sessionCount === 0"
            @click="handleKick(row)"
          >踢下线</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > 0"
      class="pagination"
      background
      layout="total, sizes, prev, pager, next"
      :total="total"
      :page-size="pageSize"
      :current-page="currentPage"
      :page-sizes="[10, 20, 50]"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getAdminUsers, kickUserSessions, updateUserStatus } from '../../api/admin'

const users = ref([])
const loading = ref(false)
const keyword = ref('')
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

async function fetchUsers(page = currentPage.value) {
  loading.value = true
  currentPage.value = page
  try {
    const res = await getAdminUsers({
      page: currentPage.value,
      size: pageSize.value,
      keyword: keyword.value || undefined
    })
    users.value = res.records || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchUsers(1)
}

function handlePageChange(page) {
  fetchUsers(page)
}

function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  fetchUsers(1)
}

async function handleStatus(row, status) {
  await updateUserStatus(row.id, status)
  ElMessage.success(status === 0 ? `已封禁用户 ${row.username}，Session 已清除` : `已解封用户 ${row.username}`)
  await fetchUsers()
}

async function handleKick(row) {
  await kickUserSessions(row.id)
  ElMessage.success(`已踢出 ${row.username} 的所有设备`)
  await fetchUsers()
}

onMounted(() => fetchUsers())
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-total {
  margin-left: auto;
  font-size: 13px;
  color: #6b7280;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 13px;
  font-weight: 500;
}

.displayname {
  font-size: 11px;
  color: #9ca3af;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
