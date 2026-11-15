<template>
  <el-dialog
    v-model="visible"
    title="加入收藏"
    width="560px"
    :close-on-click-modal="false"
    :append-to-body="true"
    destroy-on-close
    @open="handleOpen"
  >
    <div class="dialog-body">
      <div class="section-title">选择收藏夹</div>
      <el-radio-group v-model="selectedId" class="folder-list">
        <el-radio
          v-for="folder in folders"
          :key="folder.id"
          :label="folder.id"
          border
          class="folder-card"
        >
          <div class="folder-header">
            <strong>{{ folder.name }}</strong>
            <span>{{ folder.itemCount || 0 }} 项</span>
          </div>
        </el-radio>
      </el-radio-group>

      <div class="folder-actions">
        <el-button size="small" @click="createDialogVisible = true">新建收藏夹</el-button>
      </div>

      <div class="section-title">掌握状态</div>
      <el-select v-model="learningStatus" class="learning-status-select" placeholder="请选择掌握状态">
        <el-option v-for="option in learningStatusOptions" :key="option.value" :label="option.label" :value="option.value" />
      </el-select>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog
    v-model="createDialogVisible"
    title="新建收藏夹"
    width="420px"
    :append-to-body="true"
    destroy-on-close
  >
    <el-form label-width="80px">
      <el-form-item label="名称">
        <el-input v-model="createForm.name" maxlength="50" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="resetCreateForm">取消</el-button>
      <el-button type="primary" :loading="creating" @click="handleCreateFolder">创建</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { addFavorite, createFolder } from '@/api/user'
import { useResourceCacheStore } from '@/store/resource-cache'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  itemType: { type: String, required: true },
  itemId: { type: Number, required: true }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const resourceCacheStore = useResourceCacheStore()

const folders = ref([])
const selectedId = ref(null)
const learningStatus = ref('UNREAD')
const saving = ref(false)

const createDialogVisible = ref(false)
const creating = ref(false)
const createForm = reactive({
  name: ''
})

const learningStatusOptions = [
  { label: '未读', value: 'UNREAD' },
  { label: '未掌握', value: 'LEARNING' },
  { label: '已掌握', value: 'MASTERED' }
]

async function handleOpen() {
  learningStatus.value = 'UNREAD'
  try {
    await loadFolders()
  } catch (error) {
    folders.value = []
    selectedId.value = null
    ElMessage.error(error?.message || '加载收藏夹失败')
  }
}

async function loadFolders(force = false) {
  folders.value = await resourceCacheStore.getFavoriteFolders(force)
  selectedId.value = folders.value[0]?.id ?? null
}

function resetCreateForm() {
  createDialogVisible.value = false
  createForm.name = ''
}

async function handleCreateFolder() {
  if (!createForm.name.trim()) {
    ElMessage.warning('请输入收藏夹名称')
    return
  }

  creating.value = true
  try {
    await createFolder({ name: createForm.name.trim() })
    resourceCacheStore.invalidateFavoriteFolders()
    await loadFolders(true)
    resetCreateForm()
    ElMessage.success('收藏夹创建成功')
  } catch (error) {
    ElMessage.error(error?.message || '创建失败')
  } finally {
    creating.value = false
  }
}

async function handleSubmit() {
  if (!selectedId.value) {
    ElMessage.warning('请先选择收藏夹')
    return
  }

  saving.value = true
  try {
    await addFavorite({
      folderId: selectedId.value,
      itemType: props.itemType,
      itemId: props.itemId,
      learningStatus: learningStatus.value
    })
    ElMessage.success('收藏成功')
    visible.value = false
    emit('success')
  } catch (error) {
    ElMessage.error(error?.message || '收藏失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-title {
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}

.folder-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
}

.folder-card {
  width: 100%;
  height: auto;
  margin-right: 0;
  border: 1px solid #dbe4ee;
  border-radius: 12px;
  background: #fff;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.15s;
}

.folder-card.is-checked {
  background: #ecfeff;
  border-color: #14b8a6;
}

.folder-card :deep(.el-radio__label) {
  width: 100%;
  padding-left: 10px;
  white-space: normal;
}

.folder-header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.folder-header strong {
  color: #0f172a;
  font-size: 14px;
}

.folder-header span,
.folder-desc {
  color: #64748b;
  font-size: 12px;
}

.folder-desc {
  margin-top: 6px;
  line-height: 1.6;
}

.folder-actions {
  display: flex;
  justify-content: flex-start;
}

.learning-status-select {
  width: 100%;
}

.learning-status-select :deep(.el-select__wrapper) {
  min-height: 40px;
  border-radius: 8px;
}
</style>
