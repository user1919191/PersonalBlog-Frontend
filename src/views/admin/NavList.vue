<template>
  <div>
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input v-model="keyword" placeholder="搜索名称/描述" clearable style="width:220px" @change="loadList" />
        <el-input v-model="categoryFilter" placeholder="分类筛选" clearable style="width:160px" @change="loadList" />
      </div>
      <el-button type="primary" @click="openDialog()"><el-icon><Plus /></el-icon> 添加网址</el-button>
    </div>

    <el-table :data="list" v-loading="loading" stripe style="width:100%;margin-top:12px">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="名称" width="140" />
      <el-table-column prop="category" label="分类" width="110" />
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="sortOrder" label="排序" width="70" />
      <el-table-column label="链接" width="80">
        <template #default="{ row }">
          <el-link :href="row.url" target="_blank" type="primary">访问</el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" text @click="openDialog(row)">编辑</el-button>
          <el-button type="danger" size="small" text @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > 0"
      v-model:current-page="pageNum"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      style="margin-top:16px;justify-content:flex-end"
      @current-change="loadList"
    />

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editId ? '编辑网址' : '添加网址'" width="480px">
      <el-form :model="form" label-width="70px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="URL"><el-input v-model="form.url" /></el-form-item>
        <el-form-item label="分类"><el-input v-model="form.category" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getAdminNavs, createNav, updateNav, deleteNav } from '../../api/admin'

const list = ref([])
const loading = ref(false)
const saving = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const categoryFilter = ref('')
const dialogVisible = ref(false)
const editId = ref(null)

const form = reactive({ name: '', url: '', category: '', description: '', sortOrder: 0 })

async function loadList() {
  loading.value = true
  try {
    const data = await getAdminNavs({
      pageNum: pageNum.value, pageSize: pageSize.value,
      keyword: keyword.value || undefined,
      category: categoryFilter.value || undefined
    })
    list.value = data.records
    total.value = data.total
  } finally { loading.value = false }
}

function openDialog(row = null) {
  editId.value = row?.id || null
  if (row) {
    Object.assign(form, { name: row.name, url: row.url, category: row.category,
      description: row.description || '', sortOrder: row.sortOrder || 0 })
  } else {
    Object.assign(form, { name: '', url: '', category: '', description: '', sortOrder: 0 })
  }
  dialogVisible.value = true
}

async function handleSave() {
  if (!form.name || !form.url) return ElMessage.warning('名称和URL不能为空')
  saving.value = true
  try {
    if (editId.value) await updateNav(editId.value, form)
    else await createNav(form)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadList()
  } finally { saving.value = false }
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除「${row.name}」吗？`, '确认', { type: 'warning' })
  await deleteNav(row.id)
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
.toolbar-left { display: flex; gap: 10px; }
</style>
