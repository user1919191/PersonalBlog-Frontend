<template>
  <div class="favorites-page">
    <section class="hero-card">
      <div>
        <p class="hero-kicker">收藏空间</p>
        <h1>我的收藏</h1>
      </div>
      <el-button type="primary" @click="openCreateDialog">新建收藏夹</el-button>
    </section>

    <section class="list-card">
      <el-empty v-if="folders.length === 0" description="还没有收藏夹" />
      <div v-else class="folder-list">
        <div v-for="folder in folders" :key="folder.id" class="folder-item" @click="handleFolderClick(folder)">
          <div class="folder-content">
            <div class="folder-title-row">
              <strong>{{ folder.name }}</strong>
              <el-tag size="small" effect="plain">{{ folder.itemCount || 0 }} 项</el-tag>
            </div>
            <span class="folder-time">最近更新：{{ formatTime(folder.updateTime || folder.createTime) }}</span>
          </div>
          <div class="folder-actions">
            <el-button size="small" @click.stop="openRenameDialog(folder)">重命名</el-button>
            <el-button size="small" type="danger" @click.stop="handleDeleteFolder(folder.id)">删除</el-button>
          </div>
        </div>
      </div>
    </section>

    <el-dialog v-model="showCreateDialog" title="新建收藏夹" width="420px">
      <el-input v-model="createName" maxlength="50" placeholder="请输入收藏夹名称" />
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateFolder">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showRenameDialog" title="编辑收藏夹" width="420px">
      <el-input v-model="renameName" maxlength="50" placeholder="请输入收藏夹名称" />
      <template #footer>
        <el-button @click="showRenameDialog = false">取消</el-button>
        <el-button type="primary" @click="handleRenameFolder">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createFolder, deleteFolder, getFolders, renameFolder } from '@/api/user'

const router = useRouter()
const folders = ref([])
const showCreateDialog = ref(false)
const showRenameDialog = ref(false)
const createName = ref('')
const renameName = ref('')
const renameId = ref(null)

async function loadFolders() {
  folders.value = await getFolders()
}

function openCreateDialog() {
  createName.value = ''
  showCreateDialog.value = true
}

function openRenameDialog(folder) {
  renameId.value = folder.id
  renameName.value = folder.name
  showRenameDialog.value = true
}

async function handleCreateFolder() {
  const name = createName.value.trim()
  if (!name) {
    ElMessage.warning('请输入收藏夹名称')
    return
  }
  await createFolder({ name })
  showCreateDialog.value = false
  ElMessage.success('收藏夹已创建')
  await loadFolders()
}

async function handleRenameFolder() {
  const name = renameName.value.trim()
  if (!name) {
    ElMessage.warning('请输入收藏夹名称')
    return
  }
  await renameFolder(renameId.value, { name })
  showRenameDialog.value = false
  ElMessage.success('收藏夹已更新')
  await loadFolders()
}

async function handleDeleteFolder(id) {
  try {
    await ElMessageBox.confirm('删除后会清空该收藏夹中的全部内容，是否继续？', '删除收藏夹', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await deleteFolder(id)
    ElMessage.success('已删除')
    await loadFolders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

function handleFolderClick(folder) {
  router.push({ path: `/folder/${folder.id}`, query: { name: folder.name } })
}

function formatTime(value) {
  return value ? new Date(value).toLocaleString('zh-CN') : '-'
}

onMounted(async () => {
  try {
    await loadFolders()
  } catch (error) {
    ElMessage.error(error.message || '收藏夹加载失败')
  }
})
</script>

<style scoped>
.favorites-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-card,
.list-card {
  border-radius: 22px;
  border: 1px solid #dbe4ee;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.07);
}

.hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 28px;
  background: radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 32%), radial-gradient(circle at right center, rgba(15, 118, 110, 0.12), transparent 24%), linear-gradient(135deg, #f8fbff, #f5faf7);
}

.hero-kicker {
  margin: 0 0 8px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-card h1 {
  margin: 0;
  color: #0f172a;
}

.list-card {
  padding: 20px;
}

.folder-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.folder-item {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #fff;
  cursor: pointer;
}

.folder-content {
  flex: 1;
  min-width: 0;
}

.folder-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.folder-time {
  color: #9ca3af;
  font-size: 12px;
}

.folder-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
</style>
