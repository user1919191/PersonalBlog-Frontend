<template>
  <div class="user-profile">
    <el-card class="profile-card">
      <div class="profile-header">
        <el-avatar :size="80" :src="profile.avatar || undefined" />
        <div class="profile-info">
          <h2>{{ profile.displayName || profile.username }}</h2>
          <p class="profile-email">{{ profile.email }}</p>
          <el-form :model="form" inline>
            <el-form-item label="显示名">
              <el-input v-model="form.displayName" placeholder="设置显示名" maxlength="50" style="width:200px" />
            </el-form-item>
            <el-button type="primary" @click="handleUpdateProfile">保存</el-button>
          </el-form>
        </div>
      </div>
    </el-card>

    <el-card class="favorites-card">
      <template #header>
        <div class="card-header">
          <span>我的收藏夹</span>
          <el-button type="primary" size="small" @click="showCreateDialog = true">新建收藏夹</el-button>
        </div>
      </template>

      <el-empty v-if="folders.length === 0" description="还没有收藏夹" />
      <div v-else class="folders-list">
        <el-card v-for="folder in folders" :key="folder.id" class="folder-item" @click="handleFolderClick(folder)">
          <div class="folder-header">
            <h3>{{ folder.name }}</h3>
            <el-button type="danger" size="small" @click.stop="handleDeleteFolder(folder.id)">删除</el-button>
          </div>
          <p>{{ folder.itemCount || 0 }} 项收藏</p>
        </el-card>
      </div>
    </el-card>

    <el-dialog v-model="showCreateDialog" title="新建收藏夹" width="400px">
      <el-form :model="folderForm">
        <el-form-item label="收藏夹名称">
          <el-input v-model="folderForm.name" maxlength="50" placeholder="请输入收藏夹名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateFolder">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserProfile, updateProfile, getFolders, createFolder, deleteFolder } from '../api/user'

const router = useRouter()
const profile = ref({})
const form = ref({ displayName: '' })
const folders = ref([])
const showCreateDialog = ref(false)
const folderForm = ref({ name: '' })

onMounted(async () => {
  await loadProfile()
  await loadFolders()
})

async function loadProfile() {
  try {
    profile.value = await getUserProfile()
    form.value.displayName = profile.value.displayName || profile.value.username
  } catch (error) {
    ElMessage.error('加载用户信息失败')
  }
}

async function loadFolders() {
  try {
    folders.value = await getFolders()
  } catch (error) {
    ElMessage.error('加载收藏夹失败')
  }
}

async function handleUpdateProfile() {
  if (!form.value.displayName?.trim()) {
    ElMessage.warning('请输入显示名')
    return
  }
  try {
    await updateProfile({ displayName: form.value.displayName.trim() })
    ElMessage.success('更新成功')
    await loadProfile()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

async function handleCreateFolder() {
  if (!folderForm.value.name?.trim()) {
    ElMessage.warning('请输入收藏夹名称')
    return
  }
  try {
    await createFolder({ name: folderForm.value.name.trim() })
    ElMessage.success('创建成功')
    showCreateDialog.value = false
    folderForm.value.name = ''
    await loadFolders()
  } catch (error) {
    ElMessage.error('创建失败')
  }
}

async function handleDeleteFolder(id) {
  try {
    await deleteFolder(id)
    ElMessage.success('删除成功')
    await loadFolders()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

function handleFolderClick(folder) {
  router.push({ path: `/folder/${folder.id}`, query: { name: folder.name } })
}
</script>

<style scoped>
.user-profile {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.profile-card {
  margin-bottom: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-info h2 {
  margin: 0 0 6px 0;
}

.profile-email {
  margin: 0 0 12px;
  color: #909399;
  font-size: 13px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.folders-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.folder-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.folder-item:hover {
  transform: translateY(-2px);
}

.folder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.folder-header h3 {
  margin: 0;
}
</style>
