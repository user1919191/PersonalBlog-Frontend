<template>
  <div class="series-page">
    <div class="page-toolbar">
      <div>
        <h2>专栏管理</h2>
        <p>支持创建专栏，并按分页方式管理专栏文章。</p>
      </div>
      <div class="toolbar-actions">
        <el-input
          v-model="keyword"
          clearable
          placeholder="搜索专栏名称或简介"
          style="width: 240px"
          @keyup.enter="handleSeriesSearch"
          @clear="handleSeriesSearch"
        />
        <el-button type="primary" @click="openCreateDialog">新建专栏</el-button>
      </div>
    </div>

    <el-card shadow="never">
      <el-table :data="seriesList" v-loading="seriesLoading" style="width: 100%">
        <el-table-column prop="name" label="专栏名称" min-width="180" />
        <el-table-column prop="description" label="简介" min-width="240" show-overflow-tooltip />
        <el-table-column prop="articleCount" label="文章数" width="90" align="center" />
        <el-table-column label="排序" width="120" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.sortOrder"
              :min="0"
              :max="999"
              size="small"
              @change="saveSort(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" type="primary" plain @click="openArticleDialog(row)">管理文章</el-button>
            <el-button size="small" type="primary" plain @click="saveSort(row)">保存排序</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="seriesTotal > 0"
        class="series-pagination"
        background
        layout="total, sizes, prev, pager, next"
        :total="seriesTotal"
        :page-size="seriesPageSize"
        :current-page="seriesPageNum"
        :page-sizes="[10, 20, 50]"
        @current-change="handleSeriesPageChange"
        @size-change="handleSeriesSizeChange"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑专栏' : '新建专栏'" width="520px">
      <el-form :model="form" label-position="top">
        <el-form-item label="专栏名称">
          <el-input v-model="form.name" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="封面图">
          <el-input v-model="form.coverImage" placeholder="封面图 URL，可为空" />
        </el-form-item>
        <el-form-item label="排序值">
          <el-input-number v-model="form.sortOrder" :min="0" :max="999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.description" type="textarea" :rows="4" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="articleDialogVisible"
      :title="articleDialogTitle"
      width="960px"
      destroy-on-close
    >
      <div class="article-manage-toolbar">
        <el-input
          v-model="articleKeyword"
          placeholder="搜索文章标题"
          clearable
          @change="handleArticleSearch"
          @clear="handleArticleSearch"
        />
        <span class="article-manage-tip">当前页仅显示未加入专栏或已属于当前专栏的文章</span>
      </div>

      <el-table :data="articleRows" v-loading="articleLoading" style="width: 100%">
        <el-table-column label="加入" width="90" align="center">
          <template #default="{ row }">
            <el-checkbox v-model="row.attached" @change="handleAttachChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="文章标题" min-width="280" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="专栏顺序" width="150" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.seriesOrder"
              :min="1"
              :max="999"
              :disabled="!row.attached"
              controls-position="right"
              style="width: 110px"
              @change="handleOrderChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="articleTotal > 0"
        v-model:current-page="articlePageNum"
        v-model:page-size="articlePageSize"
        :total="articleTotal"
        layout="total, prev, pager, next"
        class="article-pagination"
        @current-change="loadArticlePage"
      />

      <template #footer>
        <el-button @click="articleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="articleSaving" @click="saveSeriesArticles">保存文章关联</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createSeries,
  deleteSeries,
  getAdminArticleById,
  getAdminArticles,
  getAdminSeries,
  updateArticle,
  updateSeries
} from '@/api/admin'
import request from '@/utils/request'

const seriesList = ref([])
const seriesLoading = ref(false)
const seriesTotal = ref(0)
const seriesPageNum = ref(1)
const seriesPageSize = ref(10)
const keyword = ref('')
const dialogVisible = ref(false)
const saving = ref(false)
const editingId = ref(null)

const articleDialogVisible = ref(false)
const articleLoading = ref(false)
const articleSaving = ref(false)
const articleKeyword = ref('')
const articleRows = ref([])
const articleTotal = ref(0)
const articlePageNum = ref(1)
const articlePageSize = ref(10)
const managingSeries = ref(null)
const originalArticleState = ref({})
const articleDraftState = ref({})
const nextOrderSeed = ref(1)

const form = reactive({
  name: '',
  description: '',
  coverImage: '',
  sortOrder: 0
})

const articleDialogTitle = computed(() => {
  return managingSeries.value ? `管理《${managingSeries.value.name}》的文章` : '管理文章'
})

async function loadSeries(page = seriesPageNum.value) {
  seriesLoading.value = true
  seriesPageNum.value = page
  try {
    const data = await getAdminSeries()
    const keywordValue = keyword.value.trim().toLowerCase()
    const filtered = (Array.isArray(data) ? data : [])
      .filter(item => !keywordValue
        || (item.name || '').toLowerCase().includes(keywordValue)
        || (item.description || '').toLowerCase().includes(keywordValue))
    seriesTotal.value = filtered.length
    const start = (seriesPageNum.value - 1) * seriesPageSize.value
    seriesList.value = filtered.slice(start, start + seriesPageSize.value)
  } finally {
    seriesLoading.value = false
  }
}

function handleSeriesSearch() {
  seriesPageNum.value = 1
  loadSeries(1)
}

function handleSeriesPageChange(page) {
  loadSeries(page)
}

function handleSeriesSizeChange(size) {
  seriesPageSize.value = size
  seriesPageNum.value = 1
  loadSeries(1)
}

function resetForm() {
  editingId.value = null
  form.name = ''
  form.description = ''
  form.coverImage = ''
  form.sortOrder = 0
}

function openCreateDialog() {
  resetForm()
  dialogVisible.value = true
}

function openEditDialog(row) {
  editingId.value = row.id
  form.name = row.name || ''
  form.description = row.description || ''
  form.coverImage = row.coverImage || ''
  form.sortOrder = row.sortOrder || 0
  dialogVisible.value = true
}

async function submitForm() {
  if (!form.name.trim()) {
    ElMessage.warning('请输入专栏名称')
    return
  }
  saving.value = true
  try {
    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || '',
      coverImage: form.coverImage?.trim() || '',
      sortOrder: form.sortOrder || 0
    }
    if (editingId.value) {
      await updateSeries(editingId.value, payload)
      ElMessage.success('专栏已更新')
    } else {
      await createSeries(payload)
      ElMessage.success('专栏已创建')
    }
    dialogVisible.value = false
    await loadSeries(1)
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function saveSort(row) {
  try {
    await updateSeries(row.id, {
      name: row.name,
      description: row.description || '',
      coverImage: row.coverImage || '',
      sortOrder: row.sortOrder || 0
    })
    ElMessage.success('排序已保存')
    await loadSeries(seriesPageNum.value)
  } catch (error) {
    ElMessage.error(error.message || '排序保存失败')
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除专栏“${row.name}”吗？该专栏下文章会解除关联。`, '提示', { type: 'warning' })
    await deleteSeries(row.id)
    ElMessage.success('专栏已删除')
    if (seriesList.value.length === 1 && seriesPageNum.value > 1) {
      seriesPageNum.value -= 1
    }
    await loadSeries(seriesPageNum.value)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

function getMaxSeriesOrder() {
  const draftMaxOrder = Object.values(articleDraftState.value)
    .filter(item => item.attached)
    .reduce((max, item) => Math.max(max, Number(item.seriesOrder) || 0), 0)
  const originalMaxOrder = Object.values(originalArticleState.value)
    .filter(item => item.attached)
    .reduce((max, item) => Math.max(max, Number(item.seriesOrder) || 0), 0)
  const currentPageMax = articleRows.value
    .filter(item => item.attached)
    .reduce((max, item) => Math.max(max, Number(item.seriesOrder) || 0), 0)
  return Math.max(draftMaxOrder, originalMaxOrder, currentPageMax)
}

function nextSeriesOrder() {
  const nextOrder = Math.max(nextOrderSeed.value, getMaxSeriesOrder() + 1)
  nextOrderSeed.value = nextOrder + 1
  return nextOrder
}

function writeDraft(row) {
  articleDraftState.value[row.id] = {
    attached: row.attached,
    seriesOrder: row.seriesOrder
  }
}

function handleAttachChange(row) {
  if (row.attached && !row.seriesOrder) {
    row.seriesOrder = nextSeriesOrder()
  }
  if (!row.attached) {
    row.seriesOrder = null
  }
  writeDraft(row)
}

function handleOrderChange(row) {
  writeDraft(row)
}

function mapArticleRow(item, seriesId) {
  const draft = articleDraftState.value[item.id]
  const attached = draft ? draft.attached : item.seriesId === seriesId
  const seriesOrder = draft
    ? draft.seriesOrder
    : (item.seriesId === seriesId ? (item.seriesOrder || 1) : null)

  return {
    ...item,
    attached,
    seriesOrder
  }
}

async function loadArticlePage() {
  if (!managingSeries.value) {
    return
  }

  articleLoading.value = true
  try {
    const data = await getAdminArticles({
      pageNum: articlePageNum.value,
      pageSize: articlePageSize.value,
      keyword: articleKeyword.value || undefined
    })

    articleTotal.value = data.total || 0
    articleRows.value = (data.records || [])
      .filter(item => item.seriesId == null || item.seriesId === managingSeries.value.id)
      .map(item => mapArticleRow(item, managingSeries.value.id))
  } catch (error) {
    ElMessage.error(error.message || '文章列表加载失败')
  } finally {
    articleLoading.value = false
  }
}

async function handleArticleSearch() {
  articlePageNum.value = 1
  await loadArticlePage()
}

async function openArticleDialog(row) {
  managingSeries.value = row
  articleDialogVisible.value = true
  articleKeyword.value = ''
  articlePageNum.value = 1
  articleDraftState.value = {}

  try {
    const detail = await request({ url: `/series/${row.id}`, method: 'get' })
    originalArticleState.value = Object.fromEntries(
      (detail.articles || []).map(item => [item.id, {
        attached: true,
        seriesOrder: item.seriesOrder || 1
      }])
    )
  } catch {
    originalArticleState.value = {}
  }

  nextOrderSeed.value = getMaxSeriesOrder() + 1

  await loadArticlePage()
}

async function buildArticlePayload(articleId, seriesId, seriesOrder) {
  const detail = await getAdminArticleById(articleId)
  return {
    title: detail.title,
    content: detail.content,
    summary: detail.summary || '',
    coverImage: detail.coverImage || '',
    categoryId: detail.categoryId,
    status: detail.status,
    visibility: detail.visibility || 'PUBLIC',
    isTop: detail.isTop || 0,
    seriesId,
    seriesOrder,
    tagIds: (detail.tags || []).map(tag => tag.id)
  }
}

async function saveSeriesArticles() {
  if (!managingSeries.value) {
    return
  }

  const changedRows = Object.entries(articleDraftState.value)
    .filter(([id, draft]) => {
      const original = originalArticleState.value[Number(id)] || { attached: false, seriesOrder: null }
      const nextOrder = draft.attached ? (draft.seriesOrder || 1) : null
      const originalOrder = original.attached ? (original.seriesOrder || 1) : null
      return original.attached !== draft.attached || originalOrder !== nextOrder
    })
    .map(([id, draft]) => ({ id: Number(id), ...draft }))

  if (changedRows.length === 0) {
    ElMessage.info('没有需要保存的变更')
    articleDialogVisible.value = false
    return
  }

  articleSaving.value = true
  try {
    for (const row of changedRows) {
      const payload = await buildArticlePayload(
        row.id,
        row.attached ? managingSeries.value.id : null,
        row.attached ? (row.seriesOrder || 1) : null
      )
      await updateArticle(row.id, payload)
    }
    ElMessage.success('专栏文章关联已保存')
    articleDialogVisible.value = false
    await loadSeries(seriesPageNum.value)
  } catch (error) {
    ElMessage.error(error.message || '专栏文章关联保存失败')
  } finally {
    articleSaving.value = false
  }
}

function formatTime(value) {
  return value ? new Date(value).toLocaleString('zh-CN') : '-'
}

onMounted(() => {
  loadSeries().catch(error => {
    ElMessage.error(error.message || '专栏列表加载失败')
  })
})
</script>

<style scoped>
.series-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.page-toolbar h2 {
  margin: 0 0 6px;
  font-size: 20px;
  color: #111827;
}

.page-toolbar p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

.article-manage-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.article-manage-tip {
  color: #6b7280;
  font-size: 12px;
  white-space: nowrap;
}

.series-pagination,
.article-pagination {
  margin-top: 16px;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .page-toolbar,
  .article-manage-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-actions {
    width: 100%;
  }

  .article-manage-tip {
    white-space: normal;
  }
}
</style>
