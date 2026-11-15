<template>
  <div>
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="keyword"
          placeholder="搜索标题"
          clearable
          style="width: 220px"
          @change="handleFilterChange"
        />
        <el-select
          v-model="categoryId"
          placeholder="全部分类"
          clearable
          style="width: 160px"
          @change="handleFilterChange"
        >
          <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </div>
      <el-button type="primary" @click="$router.push('/admin/articles/new')">
        <el-icon><Plus /></el-icon>
        新建文章
      </el-button>
    </div>

    <el-table :data="articles" v-loading="loading" stripe style="width: 100%; margin-top: 12px">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" min-width="220" show-overflow-tooltip />
      <el-table-column label="分类" width="120">
        <template #default="{ row }">{{ getCategoryName(row.categoryId) }}</template>
      </el-table-column>
      <el-table-column label="专栏" min-width="150" show-overflow-tooltip>
        <template #default="{ row }">{{ getSeriesName(row.seriesId) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusMeta(row.status).type" size="small">
            {{ statusMeta(row.status).label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="可见性" width="100">
        <template #default="{ row }">
          <el-tag :type="row.visibility === 'PRIVATE' ? 'warning' : 'success'" size="small">
            {{ row.visibility === 'PRIVATE' ? '仅自己可见' : '公开' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="置顶" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.isTop === 1" type="warning" size="small">置顶</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="viewCount" label="浏览" width="80" />
      <el-table-column prop="likeCount" label="点赞" width="80" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" text @click="$router.push(`/admin/articles/${row.id}/edit`)">编辑</el-button>
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
      style="margin-top: 16px; justify-content: flex-end"
      @current-change="loadList"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { deleteArticle, getAdminArticles, getAdminSeries } from '../../api/admin'
import { getCategories } from '../../api/category'

const articles = ref([])
const categories = ref([])
const seriesList = ref([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(15)
const keyword = ref('')
const categoryId = ref(null)

function getCategoryName(id) {
  return categories.value.find(item => item.id === id)?.name || '-'
}

function getSeriesName(id) {
  if (!id) {
    return '-'
  }
  return seriesList.value.find(item => item.id === id)?.name || '-'
}

function statusMeta(value) {
  if (value === 0) return { label: '草稿', type: 'info' }
  return { label: '已发布', type: 'success' }
}

function handleFilterChange() {
  pageNum.value = 1
  loadList()
}

async function loadList() {
  loading.value = true
  try {
    const data = await getAdminArticles({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      categoryId: categoryId.value || undefined,
      keyword: keyword.value || undefined
    })
    articles.value = data.records || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除文章《${row.title}》吗？`, '确认删除', { type: 'warning' })
  await deleteArticle(row.id)
  ElMessage.success('已删除')
  loadList()
}

onMounted(async () => {
  const [categoryResult, seriesResult] = await Promise.allSettled([
    getCategories(),
    getAdminSeries()
  ])
  if (categoryResult.status === 'fulfilled') {
    categories.value = categoryResult.value || []
  }
  if (seriesResult.status === 'fulfilled') {
    seriesList.value = seriesResult.value || []
  }
  await loadList()
})
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.toolbar-left {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left {
    flex-direction: column;
  }
}
</style>
