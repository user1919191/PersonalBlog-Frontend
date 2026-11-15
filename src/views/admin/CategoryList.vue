<template>
  <div>
    <!-- 标题栏 -->
    <div class="toolbar">
      <span class="toolbar-title">共 {{ categories.length }} 个分类</span>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon> 新建分类
      </el-button>
    </div>

    <!-- 分类表格 -->
    <el-table :data="categories" v-loading="loading" stripe style="width:100%;margin-top:12px">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="分类名称" min-width="120" />
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="sortOrder" label="排序" width="80">
        <template #default="{ row }">{{ row.sortOrder ?? 0 }}</template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" text @click="openDialog(row)">编辑</el-button>
          <el-button type="danger" size="small" text @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑分类' : '新建分类'"
      width="480px"
      @closed="resetForm"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="分类描述（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" :max="999" />
          <span class="sort-tip">数字越小越靠前</span>
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
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '../../api/admin'

const categories = ref([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingId = ref(null)
const formRef = ref(null)

const form = ref({ name: '', description: '', sortOrder: 0 })

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

async function loadList() {
  loading.value = true
  try {
    categories.value = await getAdminCategories()
  } finally {
    loading.value = false
  }
}

function openDialog(row = null) {
  editingId.value = row ? row.id : null
  form.value = {
    name: row?.name ?? '',
    description: row?.description ?? '',
    sortOrder: row?.sortOrder ?? 0
  }
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
      await updateCategory(editingId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await createCategory(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadList()
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    saving.value = false
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm(
    `确定删除分类「${row.name}」吗？\n注意：删除后该分类下的文章/面经分类字段不受影响，但无法按此分类筛选。`,
    '确认删除',
    { type: 'warning' }
  )
  try {
    await deleteCategory(row.id)
    ElMessage.success('已删除')
    loadList()
  } catch (e) {
    ElMessage.error(e.message || '删除失败')
  }
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

.toolbar-title {
  font-size: 14px;
  color: #6b7280;
}

.sort-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #9ca3af;
}
</style>
