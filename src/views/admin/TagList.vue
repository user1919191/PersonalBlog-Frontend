<template>
  <div>
    <div class="toolbar">
      <span class="toolbar-title">共 {{ tags.length }} 个标签</span>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon> 新建标签
      </el-button>
    </div>

    <el-table :data="tags" v-loading="loading" stripe style="width:100%;margin-top:12px">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="标签名" min-width="140" />
      <el-table-column prop="articleCount" label="文章数" width="90" />
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" text @click="openDialog(row)">编辑</el-button>
          <el-button type="danger" size="small" text @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑标签' : '新建标签'" width="400px" @closed="resetForm">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="标签名" prop="name">
          <el-input v-model="form.name" placeholder="请输入标签名" maxlength="50" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getAdminTags, createTag, updateTag, deleteTag } from '../../api/admin'

const tags = ref([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingId = ref(null)
const formRef = ref(null)
const form = ref({ name: '' })
const rules = { name: [{ required: true, message: '请输入标签名', trigger: 'blur' }] }

async function loadList() {
  loading.value = true
  try { tags.value = await getAdminTags() } finally { loading.value = false }
}

function openDialog(row = null) {
  editingId.value = row ? row.id : null
  form.value = { name: row?.name ?? '' }
  dialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
  editingId.value = null
}

async function handleSubmit() {
  await formRef.value.validate()
  saving.value = true
  try {
    if (editingId.value) {
      await updateTag(editingId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await createTag(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadList()
  } finally {
    saving.value = false
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除标签「${row.name}」吗？`, '确认删除', { type: 'warning' })
  await deleteTag(row.id)
  ElMessage.success('已删除')
  loadList()
}

onMounted(loadList)
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.toolbar-title { font-size: 14px; color: #6b7280; }
</style>
